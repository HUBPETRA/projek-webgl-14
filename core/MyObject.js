class MyObject {
    constructor(
        GL,
        vertices,
        faces,
        shaderProgram
    ) {
        this.GL = GL;

        this.vertices = vertices;
        this.faces = faces;

        this.shaderProgram =
            shaderProgram;

        this.MODEL_MATRIX =
            LIBS.get_I4();

        this.vertexBuffer =
            GL.createBuffer();

        this.indexBuffer =
            GL.createBuffer();

        this._position =
            GL.getAttribLocation(
                shaderProgram,
                "position"
            );

        this._color =
            GL.getAttribLocation(
                shaderProgram,
                "color"
            );

        this._normal =
            GL.getAttribLocation(
                shaderProgram,
                "normal"
            );

        this._Pmatrix =
            GL.getUniformLocation(
                shaderProgram,
                "Pmatrix"
            );

        this._Vmatrix =
            GL.getUniformLocation(
                shaderProgram,
                "Vmatrix"
            );

        this._Mmatrix =
            GL.getUniformLocation(
                shaderProgram,
                "Mmatrix"
            );

        this.setup();
    }


    calculateNormals() {
        const vertexCount =
            this.vertices.length / 6;

        const normals =
            new Array(
                vertexCount * 3
            ).fill(0);


        for (
            let i = 0;
            i < this.faces.length;
            i += 3
        ) {
            const i0 =
                this.faces[i];

            const i1 =
                this.faces[i + 1];

            const i2 =
                this.faces[i + 2];


            const p0 = [
                this.vertices[
                    i0 * 6
                ],
                this.vertices[
                    i0 * 6 + 1
                ],
                this.vertices[
                    i0 * 6 + 2
                ]
            ];

            const p1 = [
                this.vertices[
                    i1 * 6
                ],
                this.vertices[
                    i1 * 6 + 1
                ],
                this.vertices[
                    i1 * 6 + 2
                ]
            ];

            const p2 = [
                this.vertices[
                    i2 * 6
                ],
                this.vertices[
                    i2 * 6 + 1
                ],
                this.vertices[
                    i2 * 6 + 2
                ]
            ];


            const e1 = [
                p1[0] - p0[0],
                p1[1] - p0[1],
                p1[2] - p0[2]
            ];

            const e2 = [
                p2[0] - p0[0],
                p2[1] - p0[1],
                p2[2] - p0[2]
            ];

            /*
                Cross dibalik agar sesuai dengan
                winding mayoritas generator object kita.
            */
            const nx =
                e2[1] * e1[2] -
                e2[2] * e1[1];

            const ny =
                e2[2] * e1[0] -
                e2[0] * e1[2];

            const nz =
                e2[0] * e1[1] -
                e2[1] * e1[0];


            for (
                const index of [
                    i0,
                    i1,
                    i2
                ]
            ) {
                normals[
                    index * 3
                ] += nx;

                normals[
                    index * 3 + 1
                ] += ny;

                normals[
                    index * 3 + 2
                ] += nz;
            }
        }


        // Gabungkan normal vertex duplikat pada seam/pole generator bulat.
        // Hanya vertex dengan normal searah digabung agar bevel/cap tidak rusak.
        const groups = new Map();
        for (let i=0;i<vertexCount;i++) {
            const key=this.vertices.slice(i*6,i*6+3).map(v=>Math.round(v*1e6)).join(',');
            if(!groups.has(key)) groups.set(key,[]);
            groups.get(key).push(i);
        }
        for(const ids of groups.values()) if(ids.length>1) {
            const sum=[0,0,0];
            for(const i of ids) for(let k=0;k<3;k++)sum[k]+=normals[i*3+k];
            for(const i of ids) {
                const dot=sum[0]*normals[i*3]+sum[1]*normals[i*3+1]+sum[2]*normals[i*3+2];
                const n2=normals[i*3]**2+normals[i*3+1]**2+normals[i*3+2]**2;
                const s2=sum[0]**2+sum[1]**2+sum[2]**2;
                if(n2<1e-15 || dot/Math.sqrt(n2*s2)>.98)
                    for(let k=0;k<3;k++)normals[i*3+k]=sum[k];
            }
        }

        for (
            let i = 0;
            i < vertexCount;
            i++
        ) {
            let nx =
                normals[
                    i * 3
                ];

            let ny =
                normals[
                    i * 3 + 1
                ];

            let nz =
                normals[
                    i * 3 + 2
                ];

            const length =
                Math.hypot(
                    nx,
                    ny,
                    nz
                );

            if (length > 0.000001) {
                nx /= length;
                ny /= length;
                nz /= length;
            }

            normals[
                i * 3
            ] = nx;

            normals[
                i * 3 + 1
            ] = ny;

            normals[
                i * 3 + 2
            ] = nz;
        }


        return normals;
    }


    setup() {
        const GL =
            this.GL;

        const normals =
            this.calculateNormals();

        /*
            Format baru:

            position  = 3 float
            color     = 3 float
            normal    = 3 float

            Total = 9 float / vertex
        */
        const renderVertices = [];

        const vertexCount =
            this.vertices.length / 6;

        for (
            let i = 0;
            i < vertexCount;
            i++
        ) {
            renderVertices.push(
                this.vertices[
                    i * 6
                ],
                this.vertices[
                    i * 6 + 1
                ],
                this.vertices[
                    i * 6 + 2
                ],

                this.vertices[
                    i * 6 + 3
                ],
                this.vertices[
                    i * 6 + 4
                ],
                this.vertices[
                    i * 6 + 5
                ],

                normals[
                    i * 3
                ],
                normals[
                    i * 3 + 1
                ],
                normals[
                    i * 3 + 2
                ]
            );
        }


        GL.bindBuffer(
            GL.ARRAY_BUFFER,
            this.vertexBuffer
        );

        GL.bufferData(
            GL.ARRAY_BUFFER,
            new Float32Array(
                renderVertices
            ),
            GL.STATIC_DRAW
        );


        GL.bindBuffer(
            GL.ELEMENT_ARRAY_BUFFER,
            this.indexBuffer
        );

        GL.bufferData(
            GL.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(
                this.faces
            ),
            GL.STATIC_DRAW
        );
    }


    render(
        VIEW_MATRIX,
        PROJECTION_MATRIX
    ) {
        const GL =
            this.GL;

        GL.useProgram(
            this.shaderProgram
        );

        GL.bindBuffer(
            GL.ARRAY_BUFFER,
            this.vertexBuffer
        );


        const stride =
            9 *
            Float32Array
                .BYTES_PER_ELEMENT;


        GL.vertexAttribPointer(
            this._position,
            3,
            GL.FLOAT,
            false,
            stride,
            0
        );

        GL.enableVertexAttribArray(
            this._position
        );


        GL.vertexAttribPointer(
            this._color,
            3,
            GL.FLOAT,
            false,
            stride,
            3 *
            Float32Array
                .BYTES_PER_ELEMENT
        );

        GL.enableVertexAttribArray(
            this._color
        );


        GL.vertexAttribPointer(
            this._normal,
            3,
            GL.FLOAT,
            false,
            stride,
            6 *
            Float32Array
                .BYTES_PER_ELEMENT
        );

        GL.enableVertexAttribArray(
            this._normal
        );


        GL.uniformMatrix4fv(
            this._Pmatrix,
            false,
            PROJECTION_MATRIX
        );

        GL.uniformMatrix4fv(
            this._Vmatrix,
            false,
            VIEW_MATRIX
        );

        GL.uniformMatrix4fv(
            this._Mmatrix,
            false,
            this.MODEL_MATRIX
        );


        GL.bindBuffer(
            GL.ELEMENT_ARRAY_BUFFER,
            this.indexBuffer
        );

        GL.drawElements(
            GL.TRIANGLES,
            this.faces.length,
            GL.UNSIGNED_SHORT,
            0
        );
    }
}
