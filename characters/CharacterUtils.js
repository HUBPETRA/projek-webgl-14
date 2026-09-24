class CharacterBuilder {
    constructor(GL, shaderProgram, originX = 0, originY = 0, originZ = 0) {
        this.GL = GL;
        this.shaderProgram = shaderProgram;
        this.origin = [originX, originY, originZ];
        this.parts = [];
    }

    addMesh(mesh, x, y, z, rotationX = 0, rotationY = 0, rotationZ = 0) {
        const object = new MyObject(
            this.GL,
            mesh.vertices,
            mesh.faces,
            this.shaderProgram
        );

        LIBS.translateX(object.MODEL_MATRIX, x + this.origin[0]);
        LIBS.translateY(object.MODEL_MATRIX, y + this.origin[1]);
        LIBS.translateZ(object.MODEL_MATRIX, z + this.origin[2]);

        if (rotationX) {
            LIBS.rotateX(object.MODEL_MATRIX, LIBS.degToRad(rotationX));
        }
        if (rotationY) {
            LIBS.rotateY(object.MODEL_MATRIX, LIBS.degToRad(rotationY));
        }
        if (rotationZ) {
            LIBS.rotateZ(object.MODEL_MATRIX, LIBS.degToRad(rotationZ));
        }

        this.parts.push(object);
        return object;
    }

    ellipsoid(rx, ry, rz, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return this.addMesh(
            generateEllipsoid(rx, ry, rz, 48, 32, color),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    cylinder(radius, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return this.addMesh(
            generateCylinder(radius, height, 24, color),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    cone(radius, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return this.addMesh(
            generateCone(radius, height, 24, color),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    frustum(bottomRadius, topRadius, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return this.addMesh(
            generateTruncatedCone(bottomRadius, topRadius, height, 28, color),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    paraboloid(rx, rz, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return this.addMesh(
            generateEllipticParaboloid(rx, rz, height, 48, 24, color),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    paraboloidSection(
        rx, rz, height,
        x, y, z,
        color,
        rotationX = 0,
        rotationY = 0,
        rotationZ = 0,
        startV = 0,
        endV = 0.68
    ) {
        return this.addMesh(
            generateEllipticParaboloidSection(
                rx, rz, height,
                48, 24,
                startV, endV,
                color
            ),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    hyperboloid(rx, rz, height, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return this.addMesh(
            generateHyperboloidOneSheet(rx, rz, height, 28, 18, 0.78, color),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    bezierTube(P0, P1, P2, P3, startRadius, endRadius, color, pathSegments = 24, radialSegments = 8) {
        const shifted = [P0, P1, P2, P3].map((p) => [
            p[0] + this.origin[0],
            p[1] + this.origin[1],
            p[2] + this.origin[2]
        ]);

        const mesh = generateBezierTail(
            shifted[0], shifted[1], shifted[2], shifted[3],
            startRadius, endRadius,
            pathSegments, radialSegments,
            color
        );

        const object = new MyObject(
            this.GL,
            mesh.vertices,
            mesh.faces,
            this.shaderProgram
        );
        this.parts.push(object);
        return object;
    }

    torus(majorRadius, minorRadius, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return this.addMesh(
            generateTorus(majorRadius, minorRadius, 20, 8, color),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    extrudedPolygon(points2D, depth, x, y, z, color, rotationX = 0, rotationY = 0, rotationZ = 0) {
        return this.addMesh(
            generateExtrudedPolygon(points2D, depth, color),
            x, y, z, rotationX, rotationY, rotationZ
        );
    }

    // Frustum dengan sumbu dari titik a ke b; rotasi rigid mempertahankan quadric.
    segment(a, b, r0, r1, color) {
        const d = b.map((v, i) => v - a[i]);
        const length = Math.hypot(...d);
        const y = d.map(v => v / length);
        const helper = Math.abs(y[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
        const cross = (u,v) => [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
        let x = cross(y, helper); const n = Math.hypot(...x); x = x.map(v => v/n);
        const z = cross(x,y);
        const object = this.frustum(r0,r1,length,0,0,0,color);
        object.MODEL_MATRIX.set([
            ...x,0,...y,0,...z,0,
            ...a.map((v,i)=>(v+b[i])/2+this.origin[i]),1
        ]);
        return object;
    }

    // Tiap segmen tetap cone frustum; kurva hanya menentukan arah sumbunya.
    curvedHorn(points, radius, color) {
        // Gabung frustum tanpa cap internal: tidak ada gelang gelap palsu pada tanduk.
        const count=40,segments=28,vertices=[],faces=[];
        for(let i=0;i<count;i++){
            const a=cubicBezier(...points,i/count),b=cubicBezier(...points,(i+1)/count);
            const d=b.map((v,k)=>v-a[k]),len=Math.hypot(...d),y=d.map(v=>v/len);
            const x=normalizeVector(crossVector(y,Math.abs(y[2])<.9?[0,0,1]:[1,0,0])),z=crossVector(x,y);
            const mesh=generateTruncatedCone(radius*Math.pow(1-i/count,.8),radius*Math.pow(1-(i+1)/count,.8),len+radius*.045,segments,color);
            const offset=vertices.length/6;
            for(let k=0;k<mesh.vertices.length;k+=6){
                const q=mesh.vertices.slice(k,k+3);
                vertices.push(...a.map((v,j)=>(v+b[j])/2+x[j]*q[0]+y[j]*q[1]+z[j]*q[2]),...color);
            }
            faces.push(...mesh.faces.slice(0,segments*6).map(v=>v+offset));
            if(i===0)for(let k=0;k<segments;k++)faces.push(offset+2*(segments+1),offset+2*(k+1),offset+2*k);
        }
        return this.addMesh({vertices,faces},0,0,0);
    }

    // Bilah giok C-shaped berketebalan tetap, cap dan dinding punya vertex terpisah.
    jadeBlade(x,y,z,color,rotationY=90){
        const n=64,vertices=[],faces=[],d=.055;
        const radii=(i)=>{const t=i/n;return [.25+.005*Math.sin(t*9),.25+.29*Math.pow(Math.sin(Math.PI*t),.48)+.06*Math.pow(Math.max(0,Math.cos(t*8*Math.PI)),14)];};
        for(const zz of [-d,d])for(let i=0;i<=n;i++){
            const a=(-125+310*i/n)*Math.PI/180;
            for(const r of radii(i))vertices.push(r*Math.cos(a),r*Math.sin(a),zz,...color);
        }
        const layer=2*(n+1);
        for(let i=0;i<n;i++){
            const a=i*2,b=a+2;
            faces.push(a,b,a+1,a+1,b,b+1,layer+a,layer+a+1,layer+b,layer+a+1,layer+b+1,layer+b);
        }
        for(const edge of [0,1]){
            const off=vertices.length/6;
            for(let i=0;i<=n;i++){
                const a=(-125+310*i/n)*Math.PI/180,r=radii(i)[edge];
                for(const zz of [-d,d])vertices.push(r*Math.cos(a),r*Math.sin(a),zz,...color.map(c=>c*.80));
            }
            for(let i=0;i<n;i++){const a=off+i*2;faces.push(a,a+1,a+2,a+1,a+3,a+2);}
        }
        // Ujung lancip memiliki ketebalan nol pada profil; cap kecil menutup ekstrusi.
        for(const i of [0,n]){const a=i*2;faces.push(a,a+1,a+layer,a+1,a+layer+1,a+layer);}
        return this.addMesh({vertices,faces},x,y,z,0,rotationY,0);
    }

    // Permukaan parametrik untuk kain/detail. Tidak dihitung sebagai quadric.
    surface(fn, nu, nv, color, shade = null) {
        const vertices=[],faces=[];
        for(let i=0;i<=nu;i++) for(let j=0;j<=nv;j++) {
            const u=i/nu,v=j/nv,p=fn(u,v);
            const c=shade?shade(u,v,p):color;
            vertices.push(...p,...c);
        }
        for(let i=0;i<nu;i++) for(let j=0;j<nv;j++) {
            const a=i*(nv+1)+j,b=a+nv+1;
            faces.push(a,b,a+1,a+1,b,b+1);
        }
        return this.addMesh({vertices,faces},0,0,0);
    }

    // Garis detail dengan kurva halus; dipakai untuk tepian kain dan kelopak.
    curve(points, radius, color, endRadius = radius) {
        return this.bezierTube(...points,radius,endRadius,color,32,10);
    }

    // Pasang generator bersumbu Y pada dua titik tanpa mendeformasi persamaannya.
    along(mesh,a,b) {
        const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d),y=d.map(v=>v/len);
        const helper=Math.abs(y[2])<.9?[0,0,1]:[1,0,0];
        const x=normalizeVector(crossVector(y,helper)),z=crossVector(x,y);
        const obj=this.addMesh(mesh,0,0,0);
        obj.MODEL_MATRIX.set([...x,0,...y,0,...z,0,...a.map((v,i)=>(v+b[i])/2+this.origin[i]),1]);
        return obj;
    }

    // Variasi warna organik prosedural; geometri quadric tidak diubah.
    tintPalette(palette, variation) {
        for(const part of this.parts) {
            let changed=false;
            for(let i=0;i<part.vertices.length;i+=6){
                const color=part.vertices.slice(i+3,i+6);
                if(!palette.some(c=>c.every((v,k)=>Math.abs(v-color[k])<1e-6)))continue;
                const p=part.vertices.slice(i,i+3),m=part.MODEL_MATRIX;
                const world=[0,1,2].map(k=>m[k]*p[0]+m[4+k]*p[1]+m[8+k]*p[2]+m[12+k]-this.origin[k]);
                const next=variation(world,color);
                for(let k=0;k<3;k++)part.vertices[i+3+k]=Math.max(0,Math.min(1,next[k]));
                changed=true;
            }
            if(changed && typeof part.setup==='function') part.setup();
        }
    }

    draw(VIEW_MATRIX, PROJECTION_MATRIX) {
        for (const object of this.parts) {
            object.render(VIEW_MATRIX, PROJECTION_MATRIX);
        }
    }
}
