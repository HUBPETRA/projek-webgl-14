/* Trimmed TRUE hyperbolic paraboloid in physical local coordinates.
 * x = side*span*u; y = A*(x/span)^2 - B*(z/chord)^2.
 * Bezier boundaries only trim the domain; they do not warp this equation.
 * Shared sampler keeps arm/fingers attached to the membrane.
 */
function sampleToothlessWing(side, span, chord, u, v, strength) {
    const leading = cubicBezier([0,0,.30],[span*.27,0,.52],
        [span*.70,0,.46],[span,0,.18],u);
    const trailing = cubicBezier([0,0,-.90],[span*.22,0,-chord*1.25],
        [span*.57,0,-chord*1.18],[span,0,.18],u);
    trailing[2] += Math.pow(Math.sin(6*Math.PI*u),2)*Math.sin(Math.PI*u)*chord*.12;
    const x=side*leading[0], z=leading[2]+(trailing[2]-leading[2])*v;
    const y=strength*(.75*Math.pow(x/span,2)-1.15*Math.pow(z/chord,2));
    return [x,y,z];
}

function generateHyperbolicParaboloidWing(side,span,chord,spanSegments,chordSegments,saddleStrength,color) {
    const vertices=[],faces=[],row=chordSegments+1;
    for(let i=0;i<=spanSegments;i++) for(let j=0;j<=chordSegments;j++) {
        vertices.push(...sampleToothlessWing(side,span,chord,i/spanSegments,j/chordSegments,saddleStrength),...color);
        if(i<spanSegments&&j<chordSegments) {
            const a=i*row+j,b=a+row;
            if(side<0) faces.push(a,a+1,b,a+1,b+1,b);
            else faces.push(a,b,a+1,a+1,b,b+1);
        }
    }
    return {vertices,faces};
}
