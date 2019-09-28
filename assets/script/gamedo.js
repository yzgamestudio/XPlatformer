// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        backgroundPrefab: {
            default: null,
            type: cc.Prefab
        },
        actor: {
            default: null,
            type: cc.Node
        },
        camera: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this.backgroundPool = [];
        this.block=0;
    },

    start () {
        // spawn star
        //this.spawnNewStar();
    },

    update (dt) {
        if(this.actor.x+this.actor.width>480){
            //this.creatNewBackground();


            var w_pos = this.actor.convertToWorldSpaceAR(cc.v2(0, 0));
            var c_pos = this.camera.parent.convertToNodeSpaceAR(w_pos);
            this.camera.x=c_pos.x;

        }
        if(this.actor.x+this.actor.width>480+this.block*960){
            this.block++;
            var newBackground  = null;
            newBackground = cc.instantiate(this.backgroundPrefab);
            this.node.addChild(newBackground);
            // 为星星设置一个随机位置
            newBackground.setPosition(cc.v2(480+this.block*960,320));
        }


    },
    creatNewBackground(){
        var newback = null;
        // 使用给定的模板在场景中生成一个新节点
        if (this.starPool.size() > 0) {
            newback = this.starPool.get(this); // this will be passed to Star's reuse method
        } else {
            newback = cc.instantiate(this.starPrefab);
        }
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newback);
        // 为星星设置一个随机位置
        newback.setPosition(this.getNewStarPosition());
        // pass Game instance to star
        newback.getComponent('Star').init(this);
        // start star timer and store star reference
    }

});
