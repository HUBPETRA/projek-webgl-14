class Environment {

    constructor(GL) {

        this.GL = GL;

        this.ground = null;

        this.rocks = [];

        this.mountains = [];

    }



    update(time) {

    }



    draw(
        VIEW_MATRIX,
        PROJECTION_MATRIX
    ) {

        if (this.ground) {

            this.ground.render(
                VIEW_MATRIX,
                PROJECTION_MATRIX
            );

        }

    }

}