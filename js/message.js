import renderMessgae from './render.js'

export default class Message{
    constructor(msg, duration){
        this.msg = msg;
        this.duration = duration;
        this.createBox();
    }

    createBox(){
        //calculate box size
    }

    display(){
        renderMessgae(this)
    }
}