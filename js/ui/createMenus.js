import Menu from './Menu.js';
import Button from "./Button.js";
import TextField from "./TextField.js";

export function createMainMenu(p2p, game, clock, page){
    const theMenu = new Menu("titlesplash", p2p, game, clock, page)

    theMenu.widgets = [

            new Button(
                "playoffline",
                50, 
                118,
                100,
                12,
            ),

            new Button(
                "host",
                38,
                135,
                37,
                12,
            ),

            new Button(
                "join",
                38, 
                149,
                36,
                12,
            ),
            new TextField(80, 136, 86, 11),
            new TextField(80, 150, 86, 11)
        ];

        theMenu.widgets[0].setCallback(theMenu.playOffline.bind(theMenu))
        theMenu.widgets[1].setCallback(theMenu.host.bind(theMenu))
        theMenu.widgets[2].setCallback(theMenu.join.bind(theMenu))
  
        theMenu.hostField = theMenu.widgets[3]
        theMenu.joinField = theMenu.widgets[4]  
        
    return theMenu;
}

export function createEndMenu(p2p, game, clock, page){
    const theMenu = new Menu("undetermined", p2p, game, clock, page)

    theMenu.widgets = [

            new Button(
                "playAgain",
                27, 
                154,
                85,
                12,
            ),

            new Button(
                "mainMenu",
                153,
                154,
                77,
                12,
            ),

        ];

        theMenu.widgets[0].setCallback(game.startNewGame.bind(game))
        theMenu.widgets[1].setCallback(page.reset.bind(page)) 
        
    return theMenu;
}