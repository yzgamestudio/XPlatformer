
cc.Class({
    extends: cc.Component,

    properties: {
        speed: cc.v2(0, 0),
        maxSpeed: cc.v2(2000, 2000),
        gravity: -1000,
        drag: 1000,
        direction: 0,
        jumpSpeed: 300
    },

    // use this for initialization
    onLoad: function () {
        //add keyboard input listener to call turnLeft and turnRight
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);
        this.collisionX = 0;
        this.collisionY = 0;

        this.prePosition = cc.v2();
        this.preStep = cc.v2();

        this.touchingNumber = 0;
        this.num = 0;
        this.num_idle = 0;
    },

    onEnable: function () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
    },

    onKeyPressed: function (event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.direction = -1;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.direction = 1;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                if (!this.jumping) {
                    this.jumping = true;
                    this.speed.y = this.jumpSpeed;
                }
                break;
        }
    },

    onKeyReleased: function (event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.direction = 0;
                break;
        }
    },

    onCollisionEnter: function (other, self) {


        this.touchingNumber++;
        this.num_idle = 180;
        // 1st step
        // get pre aabb, go back before collision
        var otherAabb = other.world.aabb;
        var otherPreAabb = other.world.preAabb.clone();

        var selfAabb = self.world.aabb;
        var selfPreAabb = self.world.preAabb.clone();

        // 2nd step
        // forward x-axis, check whether collision on x-axis
        selfPreAabb.x = selfAabb.x;
        otherPreAabb.x = otherAabb.x;

        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb) && (selfPreAabb.yMin < otherPreAabb.yMax)) {
            if (this.speed.x < 0 && (selfPreAabb.xMax > otherPreAabb.xMax) && (selfPreAabb.yMin < otherPreAabb.yMax)) {
                this.node.x = otherPreAabb.xMax - this.node.parent.x;
                this.collisionX = -1;
            }
            else if (this.speed.x > 0 && (selfPreAabb.xMin < otherPreAabb.xMin) && (selfPreAabb.yMin < otherPreAabb.yMax)) {
                this.node.x = otherPreAabb.xMin - selfPreAabb.width - this.node.parent.x;
                this.collisionX = 1;
            }

            this.speed.x = 0;
            other.touchingX = true;
            return;
        }

        // 3rd step
        // forward y-axis, check whether collision on y-axis

        selfPreAabb.y = selfAabb.y;
        otherPreAabb.y = otherAabb.y;
        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            if ((this.speed.y < 0 || this.speed.x != 0) && (selfPreAabb.yMax > otherPreAabb.yMax)) {
                this.node.y = otherPreAabb.yMax - this.node.parent.y;
                this.jumping = false;
                this.collisionY = -1;
            }
            else if ((this.speed.y > 0 || this.speed.x != 0) && (selfPreAabb.yMin < otherPreAabb.yMin)) {
                this.node.y = otherPreAabb.yMin - selfPreAabb.height - this.node.parent.y;
                this.collisionY = 1;
            }

            this.speed.y = 0;
            other.touchingY = true;
        }

    },

    onCollisionStay: function (other, self) {

        if (this.collisionY === -1) {
            if (other.node.group === 'Platform') {
                this.num++;
                if (this.num > 23) {
                    this.num = 23
                }
                if (this.num_idle > 180) {
                    this.num_idle = 180
                }
                if (this.direction === 1 && this.num === 23) {
                    var anim = this.getComponent(cc.Animation);
                    anim.play("run");
                    this.num = 0
                }
                if (this.jumping === false && this.direction === 0 && this.speed.x === 0 && this.num_idle === 180) {
                    var anim = this.getComponent(cc.Animation);
                    anim.play("idle");
                    this.num_idle = 0
                }

            }

            // this.node.y = other.world.aabb.yMax;

            // var offset = cc.v2(other.world.aabb.x - other.world.preAabb.x, 0);

            // var temp = cc.affineTransformClone(self.world.transform);
            // temp.tx = temp.ty = 0;

            // offset = cc.pointApplyAffineTransform(offset, temp);
            // this.node.x += offset.x;
        }
    },



    onCollisionExit: function (other) {
        this.touchingNumber--;
        if (this.touchingNumber === 0) {
            this.node.color = cc.Color.WHITE;
        }

        if (other.touchingX && this.touchingNumber === 0) {
            this.collisionX = 0;
            other.touchingX = false;
        }
        else if (other.touchingY && this.touchingNumber === 0) {
            other.touchingY = false;
            this.collisionY = 0;
            this.jumping = true;
        }
    },

    update: function (dt) {
        this.num_idle++;
        if (this.collisionY === 0) {
            this.speed.y += this.gravity * dt;
            if (Math.abs(this.speed.y) > this.maxSpeed.y) {
                this.speed.y = this.speed.y > 0 ? this.maxSpeed.y : -this.maxSpeed.y;
            }
            var anim = this.getComponent(cc.Animation);
            anim.play("jump");
        }

        if (this.direction === 0) {
            if (this.speed.x > 0) {
                this.speed.x -= this.drag * 3 * dt;
                if (this.speed.x <= 0) this.speed.x = 0;
            }
            else if (this.speed.x < 0) {
                this.speed.x += this.drag * 3 * dt;
                if (this.speed.x >= 0) this.speed.x = 0;
            }
        }
        else {
            this.speed.x += (this.direction > 0 ? 1 : -1) * this.drag * dt;
            if (Math.abs(this.speed.x) > this.maxSpeed.x) {
                this.speed.x = this.speed.x > 0 ? this.maxSpeed.x : -this.maxSpeed.x;
            }
        }

        if (this.speed.x * this.collisionX > 0) {
            this.speed.x = 0;
        }

        this.prePosition.x = this.node.x;
        this.prePosition.y = this.node.y;

        this.preStep.x = this.speed.x * dt;
        this.preStep.y = this.speed.y * dt;

        this.node.x += this.speed.x * dt;
        this.node.y += this.speed.y * dt;

    },
});
