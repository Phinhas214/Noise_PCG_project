class RandomMap extends Phaser.Scene {
    constructor() {
        super("randomMapScene");
        this.win_x = 5;  // Initial sample window size
        this.win_y = 5;
    }

    create() {
        const numMaptiles = 40;
        noise.seed(Math.random());  // Seed set once
        let rndlvl = [];

        let water = [86];
        let land = [1, 17, 18, 19, 35];

        const transitionLookup = [
            86, 35, 1, 18, 19, 19, 19, 19, 17, 17, 17, 17, 18, 18, 18, 18
        ];

       

        function drawGrid(grid) {
            let mask_list = [];
            let mask_row = [];
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid[i].length; j++) {
                    if (land.includes(grid[i][j])) {
                        let mask = gridCode(grid, i, j, land);
                        mask_row.push(mask);
                        applyTransitionTile(i, j, mask, grid);
                    }
                }
                mask_list.push(mask_row);
            }
            console.log(mask_list);
            return grid;
        }

        function applyTransitionTile(i, j, mask, grid) {
            const tileOffset = transitionLookup[mask];
            grid[i][j] = tileOffset;
            return grid;
        }

        function gridCheck(grid, i, j, target) {
            if (i >= 0 && i < grid.length && j >= 0 && j < grid[0].length) {
                return target.includes(grid[i][j]);
            } else {
                return false;
            }
        }

        function gridCode(grid, i, j, target) {
            let bit = 0;
            if (gridCheck(grid, i + 1, j, target)) { // Check north
                bit += 1 << 0;
            }
            if (gridCheck(grid, i - 1, j, target)) { // Check south
                bit += 1 << 1;
            }
            if (gridCheck(grid, i, j - 1, target)) { // Check east
                bit += 1 << 2;
            }
            if (gridCheck(grid, i, j + 1, target)) { // Check west
                bit += 1 << 3;
            }
            return bit;
        }

        // Grid generation logic
        const generateMap = () => {
            rndlvl = [];
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
        };

        generateMap();  // Initial map generation

        

        // const map = this.make.tilemap({
        //     data: background,
        //     tileWidth: 64,
        //     tileHeight: 64
        // });
        // const tilesheet = map.addTilesetImage("mapPack");
        // const layer = map.createLayer('backgroundLayer', tilesheet, 0, 0);

        // make tilemap (array data + tilesheet images)
        // https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObjectCreator.html#tilemap
        const map = this.make.tilemap({
            data: rndlvl,      // load direct from array
            tileWidth: 64,
            tileHeight: 64
        })
        // add tileset to tilemap
        // addTilesetImage(tilesetName [, key] [, tileWidth] [, tileHeight] [, tileMargin] [, tileSpacing] [, gid])
        const tilesheet = map.addTilesetImage("mapPack")
        // create a layer in the tilemap
        // createLayer(layerID, tileset [, x] [, y])
        const layer = map.createLayer(0, tilesheet, 0, 0)

        // Key bindings for shrinking and growing the sample window
        this.shrinkWindow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA);  // , or <
        this.growWindow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PERIOD);  // . or >

        this.swap = this.input.keyboard.addKey('S');
        this.reload = this.input.keyboard.addKey('R');

        document.getElementById('description').innerHTML = '<h2>RandomMap.js</h2><br>S: Next Scene<br>R: Restart Scene (to randomize tiles)<br>,/<: Shrink Noise Window<br>./>: Grow Noise Window';
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.reload)) {
            this.scene.restart();
        }
        if (Phaser.Input.Keyboard.JustDown(this.swap)) {
            this.scene.start("arrayMapScene");
        }

        // Adjust the sample window size and regenerate the map
        if (Phaser.Input.Keyboard.JustDown(this.shrinkWindow)) {
            if (this.win_x > 1) this.win_x -= 1;  // Shrink the noise window
            if (this.win_x > 1) this.win_x -= 1;
            console.log(`Shrinking sample window to: ${this.win_x}, ${this.win_x}`);
            this.scene.restart();  // Redraw the scene with the updated noise window
        }

        if (Phaser.Input.Keyboard.JustDown(this.growWindow)) {
            this.win_x += 1;  // Grow the noise window
            this.win_x += 1;
            console.log(`Growing sample window to: ${this.win_x}, ${this.win_x}`);
            this.scene.restart();  // Redraw the scene with the updated noise window
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}