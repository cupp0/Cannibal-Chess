import Button from "./Button.js";
import TextField from "./TextField.js";
export default class Menu {

    constructor(callbacks) {

        this.hostField = new TextField(80, 136, 86, 11);
        this.joinField = new TextField(80, 150, 86, 11);

        this.widgets = [

            new Button(
                "playoffline",
                50, 
                118,
                100,
                12,
                callbacks.playOffline
            ),

            this.hostField,
            this.joinField,

            new Button(
                "host",
                38,
                135,
                37,
                12,
                () => callbacks.hostRoom(this.hostField.text)
            ),

            new Button(
                "join",
                38, 
                149,
                36,
                12,
                () => callbacks.joinRoom(this.joinField.text)
            )
        ];
    }

    onMouseMove(mouse) {
        for (const widget of this.widgets)
            if (widget.onMouseMove)
                widget.onMouseMove(mouse);
    }

    onMouseDown(mouse) {
        for (const widget of this.widgets)
            widget.onMouseDown(mouse);
    }

    onKeyDown(e) {

        for (const widget of this.widgets)
            if (widget.onKeyDown)
                widget.onKeyDown(e);
    }
}