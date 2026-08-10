(() => {
  // Canvas 01 — Signal Bloom: step-by-step 2D daisy construction (P5.js).
  // Interaction: DRAW NEXT advances stem → leaves → petals → center.
  function resizeSketchToParent(p, parentElement) {
    if (!parentElement) return;
    p.resizeCanvas(parentElement.clientWidth, parentElement.clientHeight);
  }

  new p5((p) => {
    let holder;
    let stepButton;
    let drawStep = 0; // 0 = empty canvas
    const petalCount = 12;
    // 1 stem, 2 leaves, 3..14 petals, 15 center
    const maxStep = 2 + petalCount + 1;

    p.setup = () => {
      holder = document.getElementById("flower-illustration-a");
      const canvas = p.createCanvas(
        Math.max(holder.clientWidth, 320),
        Math.max(holder.clientHeight, 420)
      );
      canvas.parent(holder);
      p.pixelDensity(1);

      // Keep the button above the p5 canvas and wire a fresh click handler.
      stepButton = document.getElementById("signal-bloom-step");
      if (stepButton) {
        holder.appendChild(stepButton);
        stepButton.style.zIndex = "20";
        stepButton.onclick = () => {
          advanceStep();
          return false;
        };
        updateButtonLabel();
      }
    };

    p.draw = () => {
      p.background(255, 255, 255);
      drawSoft2DGrid(p);
      // Only draw flower parts that have been unlocked by clicks.
      if (drawStep > 0) {
        drawSignalFlower(drawStep);
      }
    };

    p.windowResized = () => resizeSketchToParent(p, holder);

    function advanceStep() {
      if (drawStep >= maxStep) {
        drawStep = 0;
      } else {
        drawStep += 1;
      }
      updateButtonLabel();
    }

    function updateButtonLabel() {
      if (!stepButton) return;
      if (drawStep <= 0) {
        stepButton.textContent = "DRAW NEXT";
      } else if (drawStep >= maxStep) {
        stepButton.textContent = "RESET";
      } else {
        stepButton.textContent = `NEXT (${drawStep}/${maxStep})`;
      }
    }

    function drawSignalFlower(step) {
      const cx = p.width * 0.5;
      const cy = p.height * 0.45;
      const visiblePetals = Math.max(0, Math.min(petalCount, step - 2));
      const showCenter = step >= maxStep;

      p.push();
      p.translate(cx, cy);

      // 1) Stem — same green as leaves / Canvas 02
      if (step >= 1) {
        p.stroke(72, 168, 110, 200);
        p.strokeWeight(1.4);
        p.noFill();
        p.bezier(0, 55, -24, 118, 20, 190, -6, 260);
      }

      // 2) Leaves — same green
      if (step >= 2) {
        drawIllustratedLeaf(-42, 138, -0.75, 1);
        drawIllustratedLeaf(46, 172, 0.72, 0.82);
      }

      // 3+) Petals, one per click — bubblegum pink so they stay visible on white
      for (let i = 0; i < visiblePetals; i++) {
        const a = (i * p.TWO_PI) / petalCount;
        p.push();
        p.rotate(a);
        p.noStroke();
        p.fill(255, 154, 223, 200);
        p.ellipse(42, 0, 84, 26);
        p.stroke(255, 110, 200, 230);
        p.strokeWeight(1.4);
        p.noFill();
        p.ellipse(42, 0, 84, 26);
        p.pop();
      }

      // Final) Center on top
      if (showCenter) {
        p.noStroke();
        p.fill(255, 214, 64, 240);
        p.circle(0, 0, 42);
        p.fill(255, 248, 190, 200);
        p.circle(-8, -8, 10);
      }

      p.pop();
    }

    function drawIllustratedLeaf(x, y, rotation, leafScale) {
      p.push();
      p.translate(x, y);
      p.rotate(rotation);
      p.fill(72, 168, 110, 110);
      p.stroke(72, 168, 110, 220);
      p.strokeWeight(1.2);
      p.ellipse(0, 0, 82 * leafScale, 25 * leafScale);
      p.line(-30 * leafScale, 0, 30 * leafScale, 0);
      p.pop();
    }
  });

  function drawSoft2DGrid(p) {
    p.stroke(255, 154, 223, 18);
    p.strokeWeight(1);
    for (let x = 0; x <= p.width; x += 36) {
      p.line(x, 0, x, p.height);
    }
    for (let y = 0; y <= p.height; y += 36) {
      p.line(0, y, p.width, y);
    }
  }
})();
