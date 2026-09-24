function generateEllipsoid(
    radiusX,
    radiusY,
    radiusZ,
    sectorCount,
    stackCount,
    color
) {
    const vertices = [];
    const faces = [];

    for (let i = 0; i <= stackCount; i++) {
        const stackAngle =
            Math.PI / 2 -
            (i * Math.PI / stackCount);

        const xy = Math.cos(stackAngle);
        const sinStack = Math.sin(stackAngle);

        for (let j = 0; j <= sectorCount; j++) {
            const sectorAngle =
                j * 2 * Math.PI / sectorCount;

            const x =
                radiusX *
                xy *
                Math.cos(sectorAngle);

            const y =
                radiusY *
                sinStack;

            const z =
                radiusZ *
                xy *
                Math.sin(sectorAngle);

            vertices.push(
                x,
                y,
                z,

                color[0],
                color[1],
                color[2]
            );
        }
    }

    for (let i = 0; i < stackCount; i++) {
        let k1 =
            i * (sectorCount + 1);

        let k2 =
            k1 + sectorCount + 1;

        for (
            let j = 0;
            j < sectorCount;
            j++, k1++, k2++
        ) {
            if (i !== 0) {
                faces.push(
                    k1,
                    k2,
                    k1 + 1
                );
            }

            if (i !== stackCount - 1) {
                faces.push(
                    k1 + 1,
                    k2,
                    k2 + 1
                );
            }
        }
    }

    return {
        vertices: vertices,
        faces: faces
    };
}