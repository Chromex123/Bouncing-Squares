class Player {
    constructor({position, collisionBlocks}) {
        this.position = position;
        this.collisionBlocks = collisionBlocks;
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            dimensions: {
                x: 50,
                y: 50,
            }
        }
        this.velocity = {
            x: 0,
            y: 1,
        }
        this.dimensions = {
            x: 50,
            y: 50
        }
        this.color = 'red';
        this.isPacmanOn = false;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
    }

    update() {

        this.draw();

        /* Hitbox Testing
        c.fillStyle = 'green';
        c.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.dimensions.x, this.hitbox.dimensions.y);
        */

        this.position.x += this.velocity.x;
        this.updateHitbox();
        this.checkForHorizontalCollision();
        this.applyGravity();
        this.updateHitbox();
        this.checkForVerticalCollision();
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            dimensions: {
                x: 50,
                y: 50,
            }
        }
    }

    checkForHorizontalCollision() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            if (collision({
                object1: this.hitbox,
                object2: this.collisionBlocks[i]
            })) {

                //If moving right, stop player from going through block on the right
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;

                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.dimensions.x;

                    this.position.x = this.collisionBlocks[i].position.x - offset - 0.01;
                    break;
                }

                //If moving left, stop player from moving through block on the left
                if (this.velocity.x < 0) {
                    this.velocity.x = 0;

                    const offset = this.hitbox.position.x - this.position.x;

                    this.position.x = this.collisionBlocks[i].position.x + this.collisionBlocks[i].dimensions.x - offset + 0.01;
                    break;
                }
            }
        }
    }

    applyGravity() {
        this.position.y += this.velocity.y;
        this.velocity.y+= gravity;
    }

    checkForVerticalCollision() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            if (collision({
                object1: this.hitbox,
                object2: this.collisionBlocks[i]
            })) {

                //If falling down, stop player from falling through block
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;

                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.dimensions.y;

                    this.position.y = this.collisionBlocks[i].position.y - offset - 0.01;
                    break;
                }

                //If moving up, stop player from moving through block
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;

                    const offset = this.hitbox.position.y - this.position.y;

                    this.position.y = this.collisionBlocks[i].position.y + this.collisionBlocks[i].dimensions.y - offset + 0.01;
                    break;
                }
            }
        }
    }
}

class Platform {
    constructor({position, dimensions}) {
        this.position = position;
        this.dimensions = dimensions;
        this.position.x = this.position.x - this.dimensions.x/2;
    }

    draw() {
        c.fillStyle = 'black';
        c.fillRect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
    }
}

class Enemy {
    constructor({position, collisionBlocks, velocity, color}) {
        this.position = position;
        this.collisionBlocks = collisionBlocks;
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            dimensions: {
                x: 10,
                y: 10,
            }
        }
        this.velocity = velocity;
        this.dimensions = {
            x: 10,
            y: 10
        }
        this.color = color;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.dimensions.x, this.dimensions.y);
    }

    update() {

        this.draw();

        /* Hitbox Testing
        c.fillStyle = 'green';
        c.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.dimensions.x, this.hitbox.dimensions.y);
        */

        this.position.x += this.velocity.x;
        this.updateHitbox();

        // Check if enemy has collided with the player
        if (collision({
            object1: this.hitbox,
            object2: player.hitbox
        })) {

            // Pacman powerup lets player reduce the size of enemies when they collide with player
            // After an enemy has been touched 3 times, it dissapears
            // Also reduces enemy speed
            // The original enemy cannot be affected by this
            if(player.isPacmanOn) {
                let index = enemies.indexOf(this);
                if(index != 0) {
                    // Will be less than 6 when the square has been hit 3 times
                    if(this.dimensions.x/1.25 < 6 && this.dimensions.y/1.25 < 6) {
                        enemies.splice(index, 1);
                    } else {
                        this.dimensions.x = this.dimensions.x/1.25;
                        this.dimensions.y = this.dimensions.y/1.25;
                        this.hitbox.x = this.dimensions.x;
                        this.hitbox.y = this.dimensions.y;
                        this.velocity.x = this.velocity.x/1.5;
                        this.velocity.y = this.velocity.y/1.5;
                        this.position.y = canvas.height/6;
                        this.position.x = canvas.width/2;
                    }
                }
            } else {
                isGameOver = true;
                player.color = 'black';
            }
        }

        this.checkForHorizontalCollision();
        this.applyGravity();
        this.updateHitbox();
        this.checkForVerticalCollision();
    }

    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            dimensions: {
                x: this.dimensions.x,
                y: this.dimensions.y,
            }
        }
    }

    checkForHorizontalCollision() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            if (collision({
                object1: this.hitbox,
                object2: this.collisionBlocks[i]
            })) {

                //If moving right, stop player from going through block on the right
                if (this.velocity.x > 0) {
                    this.velocity.x = this.velocity.x * -1;

                    const offset = this.hitbox.position.x - this.position.x + this.hitbox.dimensions.x;

                    this.position.x = this.collisionBlocks[i].position.x - offset - 0.01;
                    break;
                }

                //If moving left, stop player from moving through block on the left
                if (this.velocity.x < 0) {
                    this.velocity.x = this.velocity.x * -1;;

                    const offset = this.hitbox.position.x - this.position.x;

                    this.position.x = this.collisionBlocks[i].position.x + this.collisionBlocks[i].dimensions.x - offset + 0.01;
                    break;
                }
            }
        }
    }

    applyGravity() {
        this.position.y += this.velocity.y;
    }

    checkForVerticalCollision() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            if (collision({
                object1: this.hitbox,
                object2: this.collisionBlocks[i]
            })) {

                //If falling down, stop player from falling through block
                if (this.velocity.y > 0) {
                    this.velocity.y = this.velocity.y * -1;

                    const offset = this.hitbox.position.y - this.position.y + this.hitbox.dimensions.y;

                    this.position.y = this.collisionBlocks[i].position.y - offset - 0.01;
                    break;
                }

                //If moving up, stop player from moving through block
                if (this.velocity.y < 0) {
                    this.velocity.y = this.velocity.y * -1;

                    const offset = this.hitbox.position.y - this.position.y;

                    this.position.y = this.collisionBlocks[i].position.y + this.collisionBlocks[i].dimensions.y - offset + 0.01;
                    break;
                }
            }
        }
    }
}
/*
    x: (btmLeftPlatform.position.x+btmLeftPlatform.dimensions.x/2) - this.dimensions.x/2,
       (btmRightPlatform.position.x+btmRightPlatform.dimensions.x/2) - this.dimensions.x/2,
    y: [btmLeftPlatform.position.y-90, btmRightPlatform.position.y-90]
*/
class Ability {
    constructor({htmlImage, isSpawned}) {
        this.htmlImage = htmlImage;
        this.isSpawned = isSpawned;
        this.isActive = false;
        this.dimensions = {
            x: 80,
            y: 80
        }
        this.positions = {
            x: [(btmLeftPlatform.position.x+btmLeftPlatform.dimensions.x/2) - this.dimensions.x/2,
                (btmRightPlatform.position.x+btmRightPlatform.dimensions.x/2) - this.dimensions.x/2,
                (topPlatform.position.x+topPlatform.dimensions.x/2) - this.dimensions.x/2],
            y: [btmLeftPlatform.position.y-90,
                btmRightPlatform.position.y-90,
                topPlatform.position.y-90]
        }
        this.hitbox = {
            position: {
                x: this.positions.x[this.randomIndex],
                y: this.positions.y[this.randomIndex],
            },
            dimensions: {
                x: this.dimensions.x,
                y: this.dimensions.y,
            }
        }
        this.randomIndex = getRandomInt(0,2);
    }

    draw() {
        c.drawImage(this.htmlImage, this.positions.x[this.randomIndex], this.positions.y[this.randomIndex]);
    }

    update() {
            this.draw();
            this.updateHitbox();

            /* Hitbox Testing
            c.fillStyle = 'green';
            c.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.dimensions.x, this.hitbox.dimensions.y);
            */

            // Check if player has touched the powerup hitbox
            if (collision({
                object1: this.hitbox,
                object2: player.hitbox
            })) {
                this.isSpawned = false;
                this.isActive = true;
                document.getElementById("getPowerupSound").loop = false;
                document.getElementById("getPowerupSound").volume = 0.2;
                document.getElementById("getPowerupSound").play();
            }
    }
    
    updateHitbox() {
        this.hitbox = {
            position: {
                x: this.positions.x[this.randomIndex],
                y: this.positions.y[this.randomIndex],
            },
            dimensions: {
                x: this.dimensions.x,
                y: this.dimensions.y,
            }
        }
    }
}