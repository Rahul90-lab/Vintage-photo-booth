class PhotoBooth {
  constructor() {
    this.video = document.getElementById("video");
    this.filterOverlay = document.getElementById("filterOverlay");
    this.countdown = document.getElementById("countdown");
    this.photoCount = document.getElementById("photoCount");
    this.photoStrip = document.getElementById("photoStrip");
    this.stripPhotos = document.getElementById("stripPhotos");
    this.compliment = document.getElementById("compliment");
    this.flash = document.getElementById("flash");
    this.cameraSelector = document.getElementById("cameraSelector");
    this.settingsToggle = document.getElementById("settingsToggle");
    this.settingsPanel = document.getElementById("settingsPanel");
    this.photoCountSelect = document.getElementById("photoCountSelect");
    this.countdownTimeSelect = document.getElementById("countdownTimeSelect");

    this.photos = [];
    this.currentFilter = "none";
    this.isCountingDown = false;
    this.cameras = [];
    this.currentStream = null;
    this.maxPhotos = 4; // Default max photos
    this.countdownTime = 3; // Default countdown time in seconds
    this.currentLayout = "vertical"; // Default layout

    this.compliments = [
      "Looking absolutely stunning! ✨",
      "Camera loves you! 📸",
      "Those poses are on point! 💫",
      "Natural born model! 🌟",
      "Gorgeous shots! 💖",
      "You're glowing! ✨",
      "Picture perfect! 📷",
      "Absolutely radiant! 🌈",
      "Pure magic in every shot! ✨",
      "You've got that star quality! ⭐",
    ];

    this.init();
  }

  async init() {
    try {
      // Initialize settings panel
      this.initializeSettings();

      // Get available cameras
      await this.getCameras();

      // Start with default camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      this.currentStream = stream;
      this.video.srcObject = stream;
      this.setupEventListeners();
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to use the photo booth!");
    }
  }

  initializeSettings() {
    // Initialize settings panel display
    this.settingsPanel.style.display = "none";

    // Set default values for photo count select
    this.photoCountSelect.value = this.maxPhotos.toString();

    // Set default values for countdown time select
    this.countdownTimeSelect.value = this.countdownTime.toString();

    // Set default layout option
    document
      .querySelector(`.layout-option[data-layout="${this.currentLayout}"]`)
      .classList.add("active");
  }

  async getCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras = devices.filter((device) => device.kind === "videoinput");

      if (this.cameras.length > 1) {
        this.populateCameraSelector();
        this.cameraSelector.style.display = "block";
      }
    } catch (err) {
      console.error("Error getting cameras:", err);
    }
  }

  populateCameraSelector() {
    this.cameraSelector.innerHTML =
      '<option value="">📷 Select Camera</option>';
    this.cameras.forEach((camera, index) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.textContent = camera.label || `Camera ${index + 1}`;
      this.cameraSelector.appendChild(option);
    });
  }

  async switchCamera(deviceId) {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: 640,
          height: 480,
        },
      });
      this.currentStream = stream;
      this.video.srcObject = stream;
      this.applyFilter(); // Reapply current filter
    } catch (err) {
      console.error("Error switching camera:", err);
      alert("Could not switch to selected camera");
    }
  }

  setupEventListeners() {
    // Settings toggle
    this.settingsToggle.addEventListener("click", () => {
      if (this.settingsPanel.style.display === "none") {
        this.settingsPanel.style.display = "block";
        this.settingsToggle.textContent = "✖️ Close Settings";
      } else {
        this.settingsPanel.style.display = "none";
        this.settingsToggle.textContent = "⚙️ Photo Booth Settings";
      }
    });

    // Photo count selector
    this.photoCountSelect.addEventListener("change", (e) => {
      this.maxPhotos = parseInt(e.target.value);
      this.updatePhotoCount();
    });

    // Countdown time selector
    this.countdownTimeSelect.addEventListener("change", (e) => {
      this.countdownTime = parseInt(e.target.value);
    });

    // Layout options
    document.querySelectorAll(".layout-option").forEach((option) => {
      option.addEventListener("click", () => {
        document
          .querySelectorAll(".layout-option")
          .forEach((o) => o.classList.remove("active"));
        option.classList.add("active");
        this.currentLayout = option.dataset.layout;
      });
    });

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentFilter = btn.dataset.filter;
        this.applyFilter();
      });
    });

    // Camera selector
    this.cameraSelector.addEventListener("change", (e) => {
      if (e.target.value) {
        this.switchCamera(e.target.value);
      }
    });

    // Photo button
    document.getElementById("photoBtn").addEventListener("click", () => {
      if (!this.isCountingDown) {
        this.takePhoto();
      }
    });

    // Download button
    document.getElementById("downloadBtn").addEventListener("click", () => {
      this.downloadStrip();
    });

    // Reset button
    document.getElementById("resetBtn").addEventListener("click", () => {
      this.reset();
    });
  }

  applyFilter() {
    // Reset all filter effects first
    this.filterOverlay.style.filter = "none";
    this.filterOverlay.style.backgroundImage = "none";
    this.filterOverlay.style.boxShadow = "none";
    this.filterOverlay.style.mixBlendMode = "normal";
    this.filterOverlay.style.opacity = "1";

    // Reset video filter
    this.video.style.filter = "none";

    switch (this.currentFilter) {
      case "none":
        // No filter
        this.filterOverlay.style.opacity = "0";
        this.video.style.filter = "none";
        break;
      case "sepia":
        this.filterOverlay.style.mixBlendMode = "normal";
        this.filterOverlay.style.filter = "sepia(1)";
        this.filterOverlay.style.opacity = "0.7";
        this.video.style.filter = "sepia(0.7)";
        break;
      case "grayscale":
        this.filterOverlay.style.mixBlendMode = "normal";
        this.filterOverlay.style.filter = "grayscale(1)";
        this.filterOverlay.style.opacity = "0.9";
        this.video.style.filter = "grayscale(0.9)";
        break;
      case "blur":
        this.filterOverlay.style.mixBlendMode = "normal";
        this.filterOverlay.style.filter = "blur(3px)";
        this.filterOverlay.style.opacity = "0.5";
        this.video.style.filter = "blur(1.5px)";
        break;
      case "saturate":
        this.filterOverlay.style.mixBlendMode = "normal";
        this.filterOverlay.style.filter = "saturate(2.5)";
        this.filterOverlay.style.opacity = "0.7";
        this.video.style.filter = "saturate(1.75)";
        break;
      case "contrast":
        this.filterOverlay.style.mixBlendMode = "normal";
        this.filterOverlay.style.filter = "contrast(1.5)";
        this.filterOverlay.style.opacity = "0.7";
        this.video.style.filter = "contrast(1.35)";
        break;
      case "hue-rotate":
        this.filterOverlay.style.mixBlendMode = "normal";
        this.filterOverlay.style.filter = "hue-rotate(180deg)";
        this.filterOverlay.style.opacity = "0.7";
        this.video.style.filter = "hue-rotate(126deg)";
        break;
      case "invert":
        this.filterOverlay.style.mixBlendMode = "normal";
        this.filterOverlay.style.filter = "invert(0.8)";
        this.filterOverlay.style.opacity = "0.7";
        this.video.style.filter = "invert(0.56)";
        break;
      case "film-grain":
        // Apply film grain effect using a noise overlay
        this.filterOverlay.style.mixBlendMode = "overlay";
        this.filterOverlay.style.filter = "contrast(1.1) brightness(1.05)";
        // Create a noise pattern with SVG
        const noiseSvg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#noiseFilter)" opacity="0.15"/></svg>`;
        // Convert SVG to data URL
        const svgUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          noiseSvg
        )}")`;
        this.filterOverlay.style.backgroundImage = svgUrl;
        this.filterOverlay.style.opacity = "1";
        // Apply a subtle contrast and brightness to the video
        this.video.style.filter = "contrast(1.1) brightness(1.05)";
        break;
      case "vignette":
        // Apply vignette effect using box-shadow
        this.filterOverlay.style.boxShadow =
          "inset 0 0 100px rgba(0, 0, 0, 0.8)";
        this.filterOverlay.style.opacity = "1";
        // Apply a subtle contrast to the video
        this.video.style.filter = "contrast(1.1)";
        break;
      case "duotone":
        // Apply duotone effect using gradient and blend mode
        this.filterOverlay.style.filter = "grayscale(1) contrast(1.2)";
        this.filterOverlay.style.backgroundImage =
          "linear-gradient(to bottom, rgba(43, 99, 250, 0.4), rgba(255, 64, 129, 0.4))";
        this.filterOverlay.style.mixBlendMode = "color";
        this.filterOverlay.style.opacity = "1";
        // Apply grayscale to the video
        this.video.style.filter = "grayscale(0.8) contrast(1.1)";
        break;
    }
  }

  async takePhoto() {
    if (this.isCountingDown) return;
    this.isCountingDown = true;

    // Countdown
    this.countdown.style.display = "flex";
    for (let i = this.countdownTime; i > 0; i--) {
      this.countdown.textContent = i;
      await this.delay(1000);
    }
    this.countdown.style.display = "none";

    // Flash effect
    this.flash.style.display = "block";
    this.flash.classList.add("active");

    // Take photo
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const width = this.video.videoWidth;
    const height = this.video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    // Draw the video frame to the canvas
    context.drawImage(this.video, 0, 0, width, height);

    // Apply the current filter to the canvas
    if (this.currentFilter !== "none") {
      // First apply CSS filters if present - use the video's filter for consistency
      if (this.video.style.filter && this.video.style.filter !== "none") {
        // Save the original image data
        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d");
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempContext.drawImage(canvas, 0, 0);

        // Apply the filter from the video element for consistency
        context.filter = this.video.style.filter;
        context.clearRect(0, 0, width, height);
        context.drawImage(tempCanvas, 0, 0);
        context.filter = "none"; // Reset filter for subsequent operations
      }

      // Also apply overlay filter if present and different from video filter
      if (
        this.filterOverlay.style.filter &&
        this.filterOverlay.style.filter !== "none" &&
        this.filterOverlay.style.filter !== this.video.style.filter
      ) {
        // Save the current image data
        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d");
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempContext.drawImage(canvas, 0, 0);

        // Apply the overlay filter with proper opacity
        context.filter = this.filterOverlay.style.filter;
        context.clearRect(0, 0, width, height);
        context.drawImage(tempCanvas, 0, 0);
        context.filter = "none"; // Reset filter for subsequent operations

        // Apply opacity for basic filters
        if (
          [
            "sepia",
            "grayscale",
            "blur",
            "saturate",
            "contrast",
            "hue-rotate",
            "invert",
          ].includes(this.currentFilter)
        ) {
          context.globalAlpha =
            parseFloat(this.filterOverlay.style.opacity) || 0.7;
          context.drawImage(canvas, 0, 0);
          context.globalAlpha = 1.0; // Reset alpha
        }
      }

      // Apply specific effects based on filter type
      switch (this.currentFilter) {
        case "vignette":
          // Apply vignette effect
          const gradient = context.createRadialGradient(
            width / 2,
            height / 2,
            height * 0.3,
            width / 2,
            height / 2,
            height * 0.7
          );
          gradient.addColorStop(0, "rgba(0,0,0,0)");
          gradient.addColorStop(1, "rgba(0,0,0,0.7)");
          context.globalCompositeOperation = "source-over";
          context.fillStyle = gradient;
          context.fillRect(0, 0, width, height);
          break;

        case "duotone":
          // Apply duotone effect
          const duotoneCanvas = document.createElement("canvas");
          const duotoneContext = duotoneCanvas.getContext("2d");
          duotoneCanvas.width = width;
          duotoneCanvas.height = height;

          // Draw grayscale image
          duotoneContext.filter = "grayscale(1) contrast(1.2)";
          duotoneContext.drawImage(canvas, 0, 0);

          // Apply duotone gradient
          duotoneContext.globalCompositeOperation = "color";
          const duotoneGradient = duotoneContext.createLinearGradient(
            0,
            0,
            0,
            height
          );
          duotoneGradient.addColorStop(0, "rgba(43, 99, 250, 0.7)");
          duotoneGradient.addColorStop(1, "rgba(255, 64, 129, 0.7)");
          duotoneContext.fillStyle = duotoneGradient;
          duotoneContext.fillRect(0, 0, width, height);

          // Draw back to main canvas
          context.clearRect(0, 0, width, height);
          context.drawImage(duotoneCanvas, 0, 0);
          break;

        case "film-grain":
          // Apply film grain effect
          context.filter = "contrast(1.1) brightness(1.05)";
          const tempGrainCanvas = document.createElement("canvas");
          const tempGrainContext = tempGrainCanvas.getContext("2d");
          tempGrainCanvas.width = width;
          tempGrainCanvas.height = height;
          tempGrainContext.drawImage(canvas, 0, 0);

          context.clearRect(0, 0, width, height);
          context.drawImage(tempGrainCanvas, 0, 0);
          context.filter = "none";

          // Create and apply noise pattern
          const grainCanvas = document.createElement("canvas");
          const grainContext = grainCanvas.getContext("2d");
          grainCanvas.width = width;
          grainCanvas.height = height;

          // Create noise pattern
          const imageData = grainContext.createImageData(width, height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 20 - 10;
            data[i] = noise; // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
            data[i + 3] = 15; // Alpha (slightly higher opacity)
          }
          grainContext.putImageData(imageData, 0, 0);

          // Apply noise to main canvas
          context.globalCompositeOperation = "overlay";
          context.drawImage(grainCanvas, 0, 0);
          context.globalCompositeOperation = "source-over"; // Reset composite operation
          break;

        // Add cases for other filters to ensure they're properly applied to the canvas
        case "sepia":
        case "grayscale":
        case "blur":
        case "saturate":
        case "contrast":
        case "hue-rotate":
        case "invert":
          // These filters are already applied above with the CSS filter and opacity
          break;
      }
    }

    // Check if the video has a scaleX(-1) transform and flip the canvas horizontally if needed
    const videoStyle = window.getComputedStyle(this.video);
    const transform = videoStyle.getPropertyValue("transform");
    if (transform.includes("matrix(-1")) {
      const tempFlipCanvas = document.createElement("canvas");
      const tempFlipContext = tempFlipCanvas.getContext("2d");
      tempFlipCanvas.width = width;
      tempFlipCanvas.height = height;
      tempFlipContext.drawImage(canvas, 0, 0);

      context.clearRect(0, 0, width, height);
      context.save();
      context.scale(-1, 1);
      context.drawImage(tempFlipCanvas, -width, 0, width, height);
      context.restore();
    }

    // Get the data URL of the canvas
    const dataURL = canvas.toDataURL("image/jpeg", 0.9);

    // Store the photo
    this.photos.push(dataURL);

    // If we've reached the maximum number of photos, remove the oldest one
    if (this.photos.length > this.maxPhotos) {
      this.photos.shift();
    }

    // Update photo count
    this.updatePhotoCount();

    // Show the photo strip
    this.showPhotoStrip();

    // Remove flash after a delay
    setTimeout(() => {
      this.flash.classList.remove("active");
      setTimeout(() => {
        this.flash.style.display = "none";
        this.isCountingDown = false;
      }, 300);
    }, 300);
  }

  updatePhotoCount() {
    this.photoCount.textContent = `${this.photos.length}/${this.maxPhotos} photos`;
  }

  showPhotoStrip() {
    this.stripPhotos.innerHTML = "";

    // Apply the appropriate layout class
    this.stripPhotos.className = "strip-photos";
    this.stripPhotos.classList.add(`layout-${this.currentLayout}`);

    // Create and append photos based on the current layout
    if (this.currentLayout === "vertical") {
      // Vertical layout (original)
      this.photos.forEach((photo, index) => {
        const img = document.createElement("img");
        img.src = photo;
        img.className = "strip-photo";
        img.style.animationDelay = `${index * 0.2}s`;
        this.stripPhotos.appendChild(img);
      });
    } else if (this.currentLayout === "grid") {
      // Grid layout
      const container = document.createElement("div");
      container.className = "grid-container";

      this.photos.forEach((photo, index) => {
        const img = document.createElement("img");
        img.src = photo;
        img.classList.add("strip-photo", "grid-photo");
        img.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(img);
      });

      this.stripPhotos.appendChild(container);
    } else if (this.currentLayout === "collage") {
      // Collage layout
      const container = document.createElement("div");
      container.className = "collage-container";

      // Add photos with random rotation
      this.photos.forEach((photo, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "collage-wrapper";

        // Random rotation between -15 and 15 degrees
        const rotation = Math.random() * 30 - 15;
        wrapper.style.transform = `rotate(${rotation}deg)`;

        // Random position offset
        const offsetX = Math.random() * 20 - 10;
        const offsetY = Math.random() * 20 - 10;
        wrapper.style.margin = `${offsetY}px ${offsetX}px`;

        // Create and add the image
        const img = document.createElement("img");
        img.src = photo;
        img.classList.add("strip-photo", "collage-photo");
        img.style.animationDelay = `${index * 0.15}s`;
        wrapper.appendChild(img);

        container.appendChild(wrapper);
      });

      this.stripPhotos.appendChild(container);
    }

    // Random compliment
    const randomCompliment =
      this.compliments[Math.floor(Math.random() * this.compliments.length)];
    this.compliment.textContent = randomCompliment;

    this.photoStrip.style.display = "block";
    this.photoStrip.scrollIntoView({ behavior: "smooth" });
  }

  async downloadStrip() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // First, load all images to get their dimensions
    const images = [];
    for (let i = 0; i < this.photos.length; i++) {
      const img = new Image();
      img.src = this.photos[i];

      await new Promise((resolve) => {
        img.onload = () => {
          images.push(img);
          resolve();
        };
      });
    }

    if (images.length === 0) return;

    // Get viewport dimensions for responsive sizing
    const viewportWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    const isMobile = viewportWidth < 600;

    // Common settings
    const headerHeight = isMobile ? 70 : 90;
    const footerHeight = isMobile ? 50 : 60;
    const spacing = isMobile ? 15 : 20;
    const borderWidth = 2;

    // Base canvas width on viewport width for better mobile experience
    const baseCanvasWidth = Math.min(viewportWidth * 0.9, 600);

    // Set canvas dimensions and layout based on the current layout
    let canvasWidth, canvasHeight, photoWidth, photoHeight;

    if (this.currentLayout === "vertical" || this.currentLayout === undefined) {
      // Vertical layout (original)
      canvasWidth = isMobile ? baseCanvasWidth : 400;
      photoWidth = canvasWidth * 0.85; // Make photo width proportional to canvas width

      // Calculate photo heights based on aspect ratios
      const photoHeights = [];
      let totalPhotoHeight = 0;

      images.forEach((img) => {
        const aspectRatio = img.width / img.height;
        const height = photoWidth / aspectRatio;
        photoHeights.push(height);
        totalPhotoHeight += height;
      });

      canvasHeight =
        headerHeight +
        totalPhotoHeight +
        spacing * (images.length - 1) +
        footerHeight;

      // Set canvas size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Header
      this.drawHeader(ctx, canvasWidth, headerHeight);

      // Draw photos vertically
      let currentY = headerHeight;
      const photoX = (canvasWidth - photoWidth) / 2;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const photoHeight = photoHeights[i];

        // Draw photo
        ctx.drawImage(img, photoX, currentY, photoWidth, photoHeight);

        // Add border
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(photoX, currentY, photoWidth, photoHeight);

        currentY += photoHeight + spacing;
      }

      // Compliment at the bottom
      this.drawCompliment(ctx, canvasWidth, canvasHeight);
    } else if (this.currentLayout === "grid") {
      // Grid layout
      const columns = Math.min(2, images.length);
      const rows = Math.ceil(images.length / columns);

      // Calculate photo dimensions based on viewport
      canvasWidth = baseCanvasWidth;
      const availableWidth = canvasWidth - spacing * (columns + 1);
      photoWidth = availableWidth / columns;
      photoHeight = photoWidth * 0.75; // 4:3 aspect ratio

      canvasHeight =
        headerHeight + photoHeight * rows + spacing * (rows + 1) + footerHeight;

      // Set canvas size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Header
      this.drawHeader(ctx, canvasWidth, headerHeight);

      // Draw photos in a grid
      for (let i = 0; i < images.length; i++) {
        const row = Math.floor(i / columns);
        const col = i % columns;

        const x = spacing + col * (photoWidth + spacing);
        const y = headerHeight + spacing + row * (photoHeight + spacing);

        // Draw photo
        ctx.drawImage(images[i], x, y, photoWidth, photoHeight);

        // Add border
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(x, y, photoWidth, photoHeight);
      }

      // Compliment at the bottom
      this.drawCompliment(ctx, canvasWidth, canvasHeight);
    } else if (this.currentLayout === "collage") {
      // Collage layout - make it square and responsive
      canvasWidth = baseCanvasWidth;
      canvasHeight = canvasWidth; // Square canvas
      photoWidth = canvasWidth * 0.3; // 30% of canvas width
      photoHeight = photoWidth * 0.8; // 4:5 aspect ratio

      // Set canvas size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Background color or pattern
      ctx.fillStyle = "#f9f9f9";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw a decorative border
      ctx.strokeStyle = "#e74c3c";
      ctx.lineWidth = canvasWidth * 0.016; // Responsive border width
      ctx.strokeRect(
        canvasWidth * 0.02,
        canvasWidth * 0.02,
        canvasWidth * 0.96,
        canvasHeight * 0.96
      );

      // Header at the top
      ctx.fillStyle = "#2c3e50";
      ctx.font = `bold ${canvasWidth * 0.048}px Arial`; // Responsive font size
      ctx.textAlign = "center";
      ctx.fillText(
        "📸 Vintage Photo Booth",
        canvasWidth / 2,
        canvasWidth * 0.08
      );

      // Date
      ctx.font = `${canvasWidth * 0.032}px Arial`; // Responsive font size
      ctx.fillStyle = "#7f8c8d";
      const date = new Date().toLocaleDateString();
      ctx.fillText(date, canvasWidth / 2, canvasWidth * 0.13);

      // Draw photos with random rotation and position
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const radius =
        Math.min(centerX, centerY) - photoWidth / 2 - canvasWidth * 0.04;

      for (let i = 0; i < images.length; i++) {
        // Calculate position in a circular pattern
        const angle = (i / images.length) * Math.PI * 2;
        const distance = radius * (0.5 + Math.random() * 0.5);

        const x = centerX + Math.cos(angle) * distance - photoWidth / 2;
        const y = centerY + Math.sin(angle) * distance - photoHeight / 2;

        // Random rotation
        const rotation = ((Math.random() * 40 - 20) * Math.PI) / 180;

        ctx.save();
        ctx.translate(x + photoWidth / 2, y + photoHeight / 2);
        ctx.rotate(rotation);

        // Draw photo with white border
        ctx.fillStyle = "white";
        ctx.fillRect(
          -photoWidth / 2 - 5,
          -photoHeight / 2 - 5,
          photoWidth + 10,
          photoHeight + 10
        );
        ctx.drawImage(
          images[i],
          -photoWidth / 2,
          -photoHeight / 2,
          photoWidth,
          photoHeight
        );

        ctx.restore();
      }

      // Compliment at the bottom
      ctx.font = `italic ${canvasWidth * 0.036}px Arial`; // Responsive font size
      ctx.fillStyle = "#e74c3c";
      ctx.textAlign = "center";
      ctx.fillText(
        this.compliment.textContent,
        canvasWidth / 2,
        canvasHeight - canvasWidth * 0.04
      );
    }

    // Download
    const link = document.createElement("a");
    link.download = `photo-booth-${this.currentLayout}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png", 0.9);
    link.click();
  }

  // Helper method to draw the header
  drawHeader(ctx, width, headerHeight) {
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("📸 Vintage Photo Booth", width / 2, 40);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#7f8c8d";
    const date = new Date().toLocaleDateString();
    ctx.fillText(date, width / 2, 65);
  }

  // Helper method to draw the compliment
  drawCompliment(ctx, width, height) {
    ctx.font = "italic 18px Arial";
    ctx.fillStyle = "#e74c3c";
    ctx.textAlign = "center";
    ctx.fillText(this.compliment.textContent, width / 2, height - 20);
  }

  reset() {
    this.photos = [];
    this.updatePhotoCount();
    this.photoStrip.style.display = "none";
    this.currentFilter = "none";
    this.applyFilter();

    // Reset active filter button
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelector('.filter-btn[data-filter="none"]')
      .classList.add("active");

    // Reset layout to vertical
    this.currentLayout = "vertical";
    document
      .querySelectorAll(".layout-option")
      .forEach((option) => option.classList.remove("active"));
    document
      .querySelector('.layout-option[data-layout="vertical"]')
      .classList.add("active");

    // Reset photo count to default
    this.maxPhotos = 4;
    this.photoCountSelect.value = "4";

    // Reset countdown time to default
    this.countdownTime = 3;
    this.countdownTimeSelect.value = "3";

    // Hide settings panel if open
    this.settingsPanel.style.display = "none";
    this.settingsToggle.textContent = "⚙️ Photo Booth Settings";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize the photo booth when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new PhotoBooth();
});
