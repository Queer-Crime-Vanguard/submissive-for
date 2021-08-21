class Sprite {
    constructor(img, 
                horizontal_amount, 
                vertical_amount, 
                total_amount=-1) {
        this.img = img;
        this.ha = horizontal_amount;
        this.va = vertical_amount;
        this.tile_width = Math.floor(img.width/horizontal_amount);
        this.tile_height = Math.floor(img.height/vertical_amount);
        if (total_amount < 0) {
            this.tile_amount = this.ha*this.va;
        } else {
            this.tile_amount = total_amount;
        }
        this.current = -1;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.tile_width;
        this.canvas.height = this.tile_height;
        this.context = this.canvas.getContext('2d');
    }

    update() {
        let hp = this.current % this.ha;
        let vp = Math.floor(this.current/this.ha);
        this.context.clearRect(0, 0, this.tile_width, this.tile_height);
        this.context.drawImage(this.img, 
                               hp*this.tile_width, vp*this.tile_height, 
                               this.tile_width, this.tile_height,
                               0, 0,
                               this.tile_width, this.tile_height)
    }

    _nextFrame() {
        this.current++;
        this.current = this.current % this.tile_amount;
    }

    _setFrame(i) {
        this.current = i; 
    }

    nextFrame() {
        this._nextFrame();
        this.update();
    }

    setFrame(i) {
        this._setFrame(i);
        this.update();
    }

    get frame() {
        return this.canvas;
    }
    
}
