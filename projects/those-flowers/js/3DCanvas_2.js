(() => {                                                                                        // Start a private little code room so names do not leak outside.
  const palette = {                                                                             // Save the color palette used by this sketch.
    background: [6, 0, 13],                                                                     // Do this step to build the drawing.
    neon: [232, 110, 198],                                                                      // Slightly deeper pink core.
    soft: [236, 128, 208],                                                                      // Soft petal pink, a bit darker.
    pale: [245, 180, 225],                                                                      // Pale accent.
    blue: [56, 174, 255]                                                                        // Do this step to build the drawing.
  };                                                                                            // Close this object or function part.

  function resizeSketchToParent(p, parentElement) {                                             // Make a helper that fits the canvas inside its HTML box.
    if (!parentElement) return;                                                                 // 'if' checks a yes-or-no condition before doing something.
    p.resizeCanvas(parentElement.clientWidth, parentElement.clientHeight);                      // Change the canvas size to match its HTML holder.
  }                                                                                             // Close this small group of instructions.

  new p5((p) => {                                                                               // Create a new p5 drawing; 'p' is the toolbox for this canvas.
    let holder;                                                                                 // 'holder' remembers the HTML box that will contain this canvas.
    let loveStatus;                                                                             // Remember the current message for the interactive flower.
    let lovePetals = [];                                                                        // Remember the list of petals for the interactive flower.
    let pluckedCount = 0;                                                                       // Count how many petals have been clicked away.
    let loveMessage = "CLICK A PETAL";                                                          // Remember the current message for the interactive flower.

    function buildLovePetals() {                                                                // Start a helper for making or drawing petals.
      lovePetals = [];                                                                          // Store a value so the sketch can use it later.
      pluckedCount = 0;                                                                         // Track whether this petal has already been removed.
      loveMessage = "CLICK A PETAL";                                                            // Store a value so the sketch can use it later.

      for (let i = 0; i < 13; i++) {                                                            // 'for' repeats these steps many times.
        const angle = i * p.TWO_PI / 13 - p.HALF_PI;                                            // Save an angle used for rotation or circular placement.
        lovePetals.push({                                                                       // Save the current drawing position, rotation, and style.
          angle,                                                                                // Do this step to build the drawing.
          scale: 0.9 + (i % 3) * 0.08,                                                          // Do this step to build the drawing.
          hue: i % 3,                                                                           // Do this step to build the drawing.
          plucked: false,                                                                       // Track whether this petal has already been removed.
          progress: 0,                                                                          // Track how far this animation step has moved.
          fallSide: i % 2 === 0 ? -1 : 1                                                        // Do this step to build the drawing.
        });                                                                                     // Close this p5 sketch.
      }                                                                                         // Close this small group of instructions.
    }                                                                                           // Close this small group of instructions.

    p.setup = () => {                                                                           // This runs once when this canvas starts.
      holder = document.getElementById("archive-field-canvas");                                 // Find the HTML element with this exact id.
      loveStatus = document.getElementById("love-status");                                      // Find the HTML element with this exact id.
      p.createCanvas(holder.clientWidth, holder.clientHeight, p.WEBGL).parent(holder);          // Create a 3D p5 canvas inside the HTML holder.
      p.pixelDensity(1);                                                                        // Choose canvas sharpness; 1 is usually faster.
      buildLovePetals();                                                                        // Do this step to build the drawing.
    };                                                                                          // Close this object or function part.

    p.draw = () => {                                                                            // This runs again and again to animate the canvas.
      p.background(...palette.background);                                                      // Paint the whole canvas before drawing the next frame.
      p.orbitControl(1.4, 1.4, 0.08);                                                           // Let the user rotate and zoom the 3D scene with the mouse.
      drawLighting();                                                                           // Do this step to build the drawing.
      updateLovePetals();                                                                       // Do this step to build the drawing.
      drawLoveFlower();                                                                         // Do this step to build the drawing.
      updateLoveStatus();                                                                       // Do this step to build the drawing.
    };                                                                                          // Close this object or function part.

    p.windowResized = () => resizeSketchToParent(p, holder);                                    // When the browser changes size, resize this canvas too.

    p.mousePressed = () => {                                                                    // Store a value so the sketch can use it later.
      if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;    // 'if' checks a yes-or-no condition before doing something.

      const nextPetal = lovePetals.find((petal) => !petal.plucked);                             // Save a moving number used for animation.
      if (!nextPetal) {                                                                         // 'if' checks a yes-or-no condition before doing something.
        buildLovePetals();                                                                      // Do this step to build the drawing.
        return;                                                                                 // Stop here and do nothing else.
      }                                                                                         // Close this small group of instructions.

      nextPetal.plucked = true;                                                                 // Track whether this petal has already been removed.
      pluckedCount += 1;                                                                        // Track whether this petal has already been removed.
      loveMessage = pluckedCount % 2 === 1 ? "M'AMA" : "NON M'AMA";                             // Track whether this petal has already been removed.
    };                                                                                          // Close this object or function part.

    function updateLoveStatus() {                                                               // Start a reusable helper recipe.
      if (!loveStatus) return;                                                                  // 'if' checks a yes-or-no condition before doing something.
      const hint = pluckedCount >= lovePetals.length ? " / CLICK TO RESET" : " / CLICK TO PLUCK"; // Save a moving number used for animation.
      loveStatus.textContent = `${loveMessage}${hint}`;                                         // Store a value so the sketch can use it later.
    }                                                                                           // Close this small group of instructions.

    function drawLighting() {                                                                   // Softer, even lighting without blown-out highlights.
      p.ambientLight(55, 28, 58);                                                               // Stronger ambient fill so petals stay readable.
      p.directionalLight(170, 110, 165, 0.25, 0.35, -0.9);                                      // Gentle key light from front-top.
      p.directionalLight(90, 55, 110, -0.55, 0.2, 0.4);                                         // Soft fill from the left-back.
      p.pointLight(160, 90, 150, -160, -40, 180);                                               // Mild pink accent, not overexposed.
      p.pointLight(70, 90, 140, 180, 40, -140);                                                 // Cool counter-fill for depth.
    }                                                                                           // Close this small group of instructions.

    function drawReflectiveGround() {                                                           // Start a reusable helper recipe.
      p.push();                                                                                 // Save the current drawing position, rotation, and style.
      p.translate(0, 128, 0);                                                                   // Move the drawing origin to a new place.
      p.rotateX(p.HALF_PI);                                                                     // Rotate the 3D shape around the x axis.
      p.noStroke();                                                                             // Draw without an outline.
      p.specularMaterial(30, 8, 38);                                                            // Choose a shiny material for 3D shapes.
      p.shininess(90);                                                                          // Choose how glossy the 3D material looks.
      p.plane(430, 310);                                                                        // Do this step to build the drawing.
      p.pop();                                                                                  // Restore the saved drawing position, rotation, and style.

      p.push();                                                                                 // Save the current drawing position, rotation, and style.
      p.translate(0, 126, 0);                                                                   // Move the drawing origin to a new place.
      p.rotateX(p.HALF_PI);                                                                     // Rotate the 3D shape around the x axis.
      p.noFill();                                                                               // Draw only outlines, with no inside color.
      p.stroke(255, 154, 223, 42);                                                                // Choose the outline color; numbers are red, green, blue, alpha.
      p.strokeWeight(1);                                                                        // Choose how thick the outline line is.
      for (let r = 58; r < 230; r += 36) {                                                      // 'for' repeats these steps many times.
        p.circle(0, 0, r * 2);                                                                  // Draw a circle.
      }                                                                                         // Close this small group of instructions.
      p.pop();                                                                                  // Restore the saved drawing position, rotation, and style.
    }                                                                                           // Close this small group of instructions.

    function updateLovePetals() {                                                               // Start a reusable helper recipe.
      for (const petal of lovePetals) {                                                         // 'for' repeats these steps many times.
        if (petal.plucked) {                                                                    // 'if' checks a yes-or-no condition before doing something.
          petal.progress = p.min(1, petal.progress + 0.018);                                    // Choose the smaller value.
        }                                                                                       // Close this small group of instructions.
      }                                                                                         // Close this small group of instructions.
    }                                                                                           // Close this small group of instructions.

    function drawLoveFlower() {                                                                 // Start a reusable helper recipe.
      const head = p.createVector(0, -68, 18);                                                  // Save an angle used for rotation or circular placement.

      p.noStroke();                                                                             // Draw without an outline.
      drawStemBetween(p.createVector(0, 132, 0), p.createVector(0, -18, 8), 7);                 // Do this step to build the drawing.
      drawLeaf(-42, 56, -0.72);                                                                 // Do this step to build the drawing.
      drawLeaf(48, 28, 0.72);                                                                   // Do this step to build the drawing.

      p.push();                                                                                 // Save the current drawing position, rotation, and style.
      p.translate(head.x, head.y, head.z);                                                      // Move the drawing origin to a new place.
      p.rotateY(p.sin(p.frameCount * 0.008) * 0.12);                                            // Rotate the 3D shape around the y axis.

      for (const petal of lovePetals) {                                                         // 'for' repeats these steps many times.
        drawLovePetal(petal);                                                                   // Do this step to build the drawing.
      }                                                                                         // Close this small group of instructions.

      p.push();                                                                                 // Save the current drawing position, rotation, and style.
      p.translate(0, 0, 26);                                                                    // Move the drawing origin to a new place.
      p.specularMaterial(...palette.neon);                                                      // Soft pink center without harsh emissive bloom.
      p.shininess(40);                                                                          // Keep the core gently glossy.
      p.sphere(23, 30, 16);                                                                     // Draw a 3D ball.
      p.pop();                                                                                  // Restore the saved drawing position, rotation, and style.

      p.pop();                                                                                  // Restore the saved drawing position, rotation, and style.
    }                                                                                           // Close this small group of instructions.

    function drawLovePetal(petal) {                                                             // Start a reusable helper recipe.
      p.noStroke();                                                                             // Draw without an outline.
      const baseRadius = 56;                                                                    // Save an angle used for rotation or circular placement.
      const attachedX = p.cos(petal.angle) * baseRadius;                                        // Save a moving number used for animation.
      const attachedY = p.sin(petal.angle) * baseRadius * 0.72;                                 // Save a moving number used for animation.
      const t = petal.progress;                                                                 // Save a moving number used for animation.
      const fallX = attachedX + petal.fallSide * 92 * t;                                        // Save an angle used for rotation or circular placement.
      const fallY = attachedY + 152 * t * t;                                                    // Save an angle used for rotation or circular placement.
      const fallZ = p.sin(petal.angle) * 12 + 64 * t;                                           // Save an angle used for rotation or circular placement.

      p.push();                                                                                 // Save the current drawing position, rotation, and style.
      p.translate(fallX, fallY, fallZ);                                                         // Move the drawing origin to a new place.
      p.rotateZ(petal.angle + t * petal.fallSide * 2.4);                                        // Rotate the 3D shape around the z axis.
      p.rotateY(0.28 + t * 2.5 + p.sin(p.frameCount * 0.012 + petal.angle) * 0.08);             // Rotate the 3D shape around the y axis.

      if (petal.hue === 0) {                                                                    // 'if' checks a yes-or-no condition before doing something.
        p.specularMaterial(228, 62, 188);                                                       // Deeper pink petal.
      } else if (petal.hue === 1) {                                                             // Do this step to build the drawing.
        p.specularMaterial(232, 120, 205);                                                      // Mid pink petal.
      } else {                                                                                  // Do this step to build the drawing.
        p.specularMaterial(95, 175, 230);                                                       // Soft blue petal accent.
      }                                                                                         // Close this small group of instructions.
      p.shininess(36);                                                                          // Lower gloss so highlights stay soft.
      p.scale(1.5 * petal.scale, 0.5 * petal.scale, 0.09 * petal.scale);                        // Make the next shape bigger or smaller.
      p.ellipsoid(30, 30, 30, 30, 12);                                                          // Do this step to build the drawing.
      p.pop();                                                                                  // Restore the saved drawing position, rotation, and style.
    }                                                                                           // Close this small group of instructions.

    function drawLeaf(x, y, rotation) {                                                         // Start a helper that draws leaves.
      p.noStroke();                                                                             // Draw without an outline.
      p.push();                                                                                 // Save the current drawing position, rotation, and style.
      p.translate(x, y, 0);                                                                     // Move the drawing origin to a new place.
      p.rotateZ(rotation);                                                                      // Rotate the 3D shape around the z axis.
      p.rotateY(0.32);                                                                          // Rotate the 3D shape around the y axis.
      p.specularMaterial(92, 238, 204);                                                         // Choose a shiny material for 3D shapes.
      p.shininess(100);                                                                         // Choose how glossy the 3D material looks.
      p.scale(1.7, 0.45, 0.12);                                                                 // Make the next shape bigger or smaller.
      p.ellipsoid(28, 28, 28, 24, 10);                                                          // Do this step to build the drawing.
      p.pop();                                                                                  // Restore the saved drawing position, rotation, and style.
    }                                                                                           // Close this small group of instructions.

    function drawStemBetween(start, end, radius) {                                              // Start a reusable helper recipe.
      p.noStroke();                                                                             // Draw without an outline.
      const direction = p5.Vector.sub(end, start);                                              // Save a moving number used for animation.
      const midpoint = p5.Vector.add(start, end).mult(0.5);                                     // Save a moving number used for animation.
      const length = direction.mag();                                                           // Save a moving number used for animation.
      const yAxis = p.createVector(0, 1, 0);                                                    // Save an angle used for rotation or circular placement.
      const axis = yAxis.cross(direction);                                                      // Save an angle used for rotation or circular placement.
      const angle = yAxis.angleBetween(direction);                                              // Save an angle used for rotation or circular placement.

      p.push();                                                                                 // Save the current drawing position, rotation, and style.
      p.translate(midpoint.x, midpoint.y, midpoint.z);                                          // Move the drawing origin to a new place.
      if (axis.mag() > 0.0001) {                                                                // 'if' checks a yes-or-no condition before doing something.
        p.rotate(angle, [axis.x, axis.y, axis.z]);                                              // Rotate the 2D drawing direction.
      }                                                                                         // Close this small group of instructions.
      p.specularMaterial(92, 238, 204);                                                         // Choose a shiny material for 3D shapes.
      p.shininess(120);                                                                         // Choose how glossy the 3D material looks.
      p.cylinder(radius, length, 18, 6);                                                        // Draw a 3D cylinder.
      p.pop();                                                                                  // Restore the saved drawing position, rotation, and style.
    }                                                                                           // Close this small group of instructions.

    function drawFloatingSparks() {                                                             // Start a reusable helper recipe.
      p.noStroke();                                                                             // Draw without an outline.
      for (let i = 0; i < 48; i++) {                                                            // 'for' repeats these steps many times.
        const a = i * 1.91 + p.frameCount * 0.004;                                              // Save an angle used for rotation or circular placement.
        const r = 70 + (i % 8) * 18;                                                            // 'const' saves a value that should stay the same for this step.
        const x = p.cos(a) * r;                                                                 // Save the left-right position.
        const y = -24 + p.sin(i * 0.8 + p.frameCount * 0.01) * 92;                              // Save the up-down position.
        const z = p.sin(a) * r * 0.72;                                                          // 'const' saves a value that should stay the same for this step.
        const glow = p.map(p.sin(p.frameCount * 0.05 + i), -1, 1, 0.45, 1);                     // Save a transparency value for a glowing effect.
        p.push();                                                                               // Save the current drawing position, rotation, and style.
        p.translate(x, y, z);                                                                   // Move the drawing origin to a new place.
        if (i % 4 === 0) {                                                                      // 'if' checks a yes-or-no condition before doing something.
          p.emissiveMaterial(56 * glow, 174 * glow, 255 * glow);                                // Do this step to build the drawing.
        } else {                                                                                // Do this step to build the drawing.
          p.emissiveMaterial(255 * glow, 142 * glow, 232 * glow);                               // Do this step to build the drawing.
        }                                                                                       // Close this small group of instructions.
        p.sphere(2.2 + (i % 3), 10, 8);                                                         // Draw a 3D ball.
        p.pop();                                                                                // Restore the saved drawing position, rotation, and style.
      }                                                                                         // Close this small group of instructions.
    }                                                                                           // Close this small group of instructions.
  });                                                                                           // Close this p5 sketch.
})();                                                                                           // Run this private code room now.
