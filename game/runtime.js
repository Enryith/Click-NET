const fs = require("fs");
const uuid = require('uuid/v4');

const types = [
    'paladin',
    'swordsman',
    'mage'
];

const monsters = {
    spider: {
        name: 'spider',
        display: 'Spider',
        health: 1000,
        attacks: {
            web: {
                display: "Shoot Web",
                damage: 10
            }
        }
    },
    alien: {
        name: 'alien',
        display: 'Alien',
        health: 1500,
        attacks: {
            spit: {
                display: "Spit",
                damage: 9
            }
        }
    },
    worm: {
        name: 'worm',
        display: 'Worm',
        health: 700,
        attacks: {
            worm: {
                display: "Worm",
                damage: 0
            },
            death_beam: {
                display: "Laser",
                damage: 20
            }
        }
    },
    small_domino: {
        name: 'small_domino',
        display: 'Domino Baby',
        health: 1800,
        attacks: {
            cuteness: {
                display: "Baby",
                damage: -1
            },
            cry: {
                display: "Cry",
                damage: 10
            }
        }
    }
};

const progress = [
    {
        required: 10,
        backgrounds: [
            'windows',
            'cave'
        ],
        enemies: [
           monsters.spider,
           monsters.alien
        ],
        healthMultiplier: 1
    },
    {
        required: 1,
        background: [
            'fire'
        ],
        enemies: [
           monsters.small_domino
        ],
        healthMultiplier: 5
    },
    {
        required: 10,
        background: [
            'castle'
        ],
        enemies: [
            monsters.worm,
            monsters.alien,
            monsters.spider
        ],
        healthMultiplier: 2,
    }
];

class Runtime {
    constructor() {
        this.defaults();
        let runtime = this;
        fs.readFile('runtime.json', 'utf8', function (err, data) {
            if (err) {
                console.log(err);
                return;
            }

            let json = JSON.parse(data);
            runtime.load(json);
            console.log("Loaded!");
        });
    }

    defaults() {
        this.killsTotal = 0;
        this.killsStage = 0;
        this.stage = 0;
        this.players = [];
        this.monster = monsters.spider;
        this.scene = {
            background: 'windows'
        }
    }

    load(json) {
        this.key(json, 'players');
        this.key(json, 'stage');
        this.key(json, 'killsStage');
        this.key(json, 'killsTotal');
        this.key(json, 'monster');
        this.key(json, 'scene');
    }

    save() {
        let json = JSON.stringify(this);
        fs.writeFile('runtime.json', json, 'utf8', function () {});
    }

    key(json, key) {
        if (json[key] !== undefined) this[key] = json[key];
    }

    get(id) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                return this.players[i];
            }
        }

        return null;
    }

    quit(id) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                this.players.splice(i, 1);
            }
        }
    }

    join(res, id, name = undefined, type = undefined) {
        if (id !== undefined) {
            let found = this.get(id);
            if (found) {
                console.log("NOTICE: Reconnected " + found.name);
                return found;
            }
        }

        if (typeof name != "string") {
            console.log("WARNING: Player name not a string!");
            res.clearCookie('id');
            res.redirect("/");
            return undefined;
        }

        if (name.length < 3) {
            console.log("WARNING: Player name not long enough!");
            res.clearCookie('id');
            res.redirect("/");
            return undefined;
        }

        if (!types.includes(type)) {
            console.log("WARNING: Player incorrect class!");
            res.clearCookie('id');
            res.redirect("/");
            return undefined;
        }

        let player = {
            id: uuid(),
            name: name.substring(0, 12),
            level: 1,
            clicks: 0,
            type: type
        };

        this.players.push(player);
        res.cookie('id', player.id);
        console.log("NOTICE: Connected " + player.name);

        return player;
    }
}

module.exports = Runtime;