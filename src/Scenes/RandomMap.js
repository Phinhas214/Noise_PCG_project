class RandomMap extends Phaser.Scene {
    constructor() {
        super("randomMapScene");
        this.win_x = 5;  // Initial sample window size
        this.win_y = 5;
    }

    // Move generateMap here as a class method
    generateMap() {
        const numMaptiles = 40;
        let rndlvl = [];

        let water = [86];
        let land = [1, 17, 18, 19, 35];

        const transitionLookup = [
            86, 35, 1, 18, 19, 19, 19, 19, 17, 17, 17, 17, 18, 18, 18, 18
        ];

        const drawGrid = (grid) => {
            let mask_list = [];
            for (let i = 0; i < grid.length; i++) {
                let mask_row = [];
                for (let j = 0; j < grid[i].length; j++) {
                    if (land.includes(grid[i][j])) {
                        let mask = this.gridCode(grid, i, j, land);
                        mask_row.push(mask);
                        this.applyTransitionTile(i, j, mask, grid);
                    }
                }
                mask_list.push(mask_row);
            }
            //(mask_list);
            return grid;
        };

        for (let rows = 0; rows < 20; rows++) {
            let row = [];
            for (let col = 0; col < 20; col++) {
                let n = noise.simplex2(rows / this.win_x, col / this.win_y);  // Use the current sample window size
                if (n < -0.3) {
                    row.push(water[0]);  // Water
                } else {
                    row.push(land[0]);  // Land
                }
            }
            rndlvl.push(row);
        }
        rndlvl = drawGrid(rndlvl);

        const map = this.make.tilemap({
            data: rndlvl,      // load direct from array
            tileWidth: 64,
            tileHeight: 64
        });

        const tilesheet = map.addTilesetImage("mapPack");
        const layer = map.createLayer(0, tilesheet, 0, 0);
    }

    create() {
        noise.seed(Math.random());  // Seed set once
        this.generateMap();  // Initial map generation

        // Key bindings for shrinking and growing the sample window
        this.shrinkWindow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA);  // , or <
        this.growWindow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD);  // . or >

        this.swap = this.input.keyboard.addKey('S');
        this.reload = this.input.keyboard.addKey('R');

        document.getElementById('description').innerHTML = '<h2>RandomMap.js</h2><br>S: Next Scene<br>R: Restart Scene (to randomize tiles)<br>,/<: Shrink Noise Window<br>./>: Grow Noise Window';
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.reload)) {
            console.log("restart scene");
            this.scene.restart();
        }
        if (Phaser.Input.Keyboard.JustDown(this.swap)) {
            this.scene.start("arrayMapScene");
        }

        // Adjust the sample window size and regenerate the map
        if (Phaser.Input.Keyboard.JustDown(this.shrinkWindow)) {
            if (this.win_x < 20) this.win_x += 1;  // Shrink the noise window
            if (this.win_y < 20) this.win_y += 1;
            console.log(`Shrinking sample window to: ${this.win_x}, ${this.win_y}`);
            this.generateMap();  // Redraw the scene with the updated noise window
        }

        if (Phaser.Input.Keyboard.JustDown(this.growWindow)) {
            if (this.win_x >= 1) this.win_x -= 1;  // Grow the noise window
            if (this.win_y >= 1) this.win_y -= 1;
            console.log(`Growing sample window to: ${this.win_x}, ${this.win_y}`);
            this.generateMap();  // Redraw the scene with the updated noise window
        }
    }

    applyTransitionTile(i, j, mask, grid) {
        const transitionLookup = [86, 35, 1, 18, 19, 19, 19, 19, 17, 17, 17, 17, 18, 18, 18, 18];
        const tileOffset = transitionLookup[mask];
        grid[i][j] = tileOffset;
    }

    gridCheck(grid, i, j, target) {
        if (i >= 0 && i < grid.length && j >= 0 && j < grid[0].length) {
            return target.includes(grid[i][j]);
        } else {
            return false;
        }
    }

    gridCode(grid, i, j, target) {
        let bit = 0;
        if (this.gridCheck(grid, i + 1, j, target)) { // Check north
            bit += 1 << 0;
        }
        if (this.gridCheck(grid, i - 1, j, target)) { // Check south
            bit += 1 << 1;
        }
        if (this.gridCheck(grid, i, j - 1, target)) { // Check east
            bit += 1 << 2;
        }
        if (this.gridCheck(grid, i, j + 1, target)) { // Check west
            bit += 1 << 3;
        }
        return bit;
    }
}