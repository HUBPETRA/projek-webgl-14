const VERTEX_SHADER_SOURCE = `
    attribute vec3 position;
    attribute vec3 color;
    attribute vec3 normal;

    uniform mat4 Pmatrix;
    uniform mat4 Vmatrix;
    uniform mat4 Mmatrix;

    varying vec3 vColor;
    varying vec3 vNormal;

    void main(void) {
        gl_Position =
            Pmatrix *
            Vmatrix *
            Mmatrix *
            vec4(position, 1.0);

        vColor = color;

        /*
            MODEL_MATRIX saat ini hanya memakai
            translation + rotation.
            Normal bisa ditransform dengan mat3(Mmatrix).
        */
        vNormal =
            normalize(
                mat3(Mmatrix) *
                normal
            );
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;

    varying vec3 vColor;
    varying vec3 vNormal;

    void main(void) {
        vec3 N =
            normalize(vNormal);

        vec3 lightDirection =
            normalize(
                vec3(
                    -0.45,
                    0.80,
                    0.55
                )
            );

        /*
            abs dipakai karena beberapa object kita
            merupakan open surface / two-sided mesh.
            Ini membuat kedua sisi sayap tetap terbaca.
        */
        float diffuse =
            abs(
                dot(
                    N,
                    lightDirection
                )
            );

        float ambient =
            0.38;

        float brightness =
            ambient +
            diffuse * 0.62;

        vec3 finalColor =
            vColor *
            brightness;

        gl_FragColor =
            vec4(
                finalColor,
                1.0
            );
    }
`;

function compileShader(
    GL,
    source,
    type
) {
    const shader =
        GL.createShader(type);

    GL.shaderSource(
        shader,
        source
    );

    GL.compileShader(shader);

    if (
        !GL.getShaderParameter(
            shader,
            GL.COMPILE_STATUS
        )
    ) {
        console.error(
            "Shader error:",
            GL.getShaderInfoLog(shader)
        );

        GL.deleteShader(shader);

        return null;
    }

    return shader;
}

function createShaderProgram(GL) {
    const vertexShader =
        compileShader(
            GL,
            VERTEX_SHADER_SOURCE,
            GL.VERTEX_SHADER
        );

    const fragmentShader =
        compileShader(
            GL,
            FRAGMENT_SHADER_SOURCE,
            GL.FRAGMENT_SHADER
        );

    const program =
        GL.createProgram();

    GL.attachShader(
        program,
        vertexShader
    );

    GL.attachShader(
        program,
        fragmentShader
    );

    GL.linkProgram(program);

    if (
        !GL.getProgramParameter(
            program,
            GL.LINK_STATUS
        )
    ) {
        console.error(
            "Program error:",
            GL.getProgramInfoLog(
                program
            )
        );

        return null;
    }

    return program;
}
