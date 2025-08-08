<script>
// @ts-nocheck

	import { browser } from '$app/environment';

	let canvasEl = $state(null);
	const mouse = $state({ x: null, y: null });

const config = {
    pointColor: 'rgba(18, 16, 43, 0)',
    lineColor: 'rgba(18, 16, 43, 0)',
    pointRadius: 2,
    gridGap: 50,
    mouseRadius: 200,
    repelForce: 0,
    restoreForce: 0.003,
    damping: 0.95,
    maxLineDist: 80
};

	class Point {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.ox = x;
			this.oy = y;
			this.vx = 0;
			this.vy = 0;
		}
		update() {
			let dxMouse = this.x - mouse.x;
			let dyMouse = this.y - mouse.y;
			let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
			let force =
				distMouse < config.mouseRadius
					? -config.repelForce * (1 - distMouse / config.mouseRadius)
					: 0;
			let restoreX = (this.ox - this.x) * config.restoreForce;
			let restoreY = (this.oy - this.y) * config.restoreForce;
			let fx = (distMouse !== 0 ? (dxMouse / distMouse) * force : 0) + restoreX;
			let fy = (distMouse !== 0 ? (dyMouse / distMouse) * force : 0) + restoreY;
			this.vx += fx;
			this.vy += fy;
			this.vx *= config.damping;
			this.vy *= config.damping;
			this.x += this.vx;
			this.y += this.vy;
		}
		draw(ctx) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, config.pointRadius, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	$effect(() => {
		if (!browser || !canvasEl) return;

		const canvas = canvasEl;
		const ctx = canvas.getContext('2d');
		let points = [];
		let width = window.innerWidth;
		let height = window.innerHeight;

		const init = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height;
			points = [];
			for (let x = -config.gridGap; x < width + config.gridGap; x += config.gridGap) {
				for (let y = -config.gridGap; y < height + config.gridGap; y += config.gridGap) {
					points.push(new Point(x, y));
				}
			}
		};

		let animationFrameId;
		const animate = () => {
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = config.pointColor;
			if (mouse.x !== null && mouse.y !== null) {
				for (let i = 0; i < points.length; i++) {
					for (let j = i + 1; j < points.length; j++) {
						let dx = points[i].x - points[j].x;
						let dy = points[i].y - points[j].y;
						let dist = Math.sqrt(dx * dx + dy * dy);

						if (dist < config.maxLineDist) {
							ctx.beginPath();
							ctx.moveTo(points[i].x, points[i].y);
							ctx.lineTo(points[j].x, points[j].y);
							
							let distMouse = Math.sqrt(
								Math.pow(mouse.x - points[i].x, 2) + Math.pow(mouse.y - points[i].y, 2)
							);
							
							if (distMouse < config.mouseRadius) {
								ctx.strokeStyle = `rgba(192, 213, 50, ${0.5 * (1 - distMouse / config.mouseRadius)})`;
							} else {
								ctx.strokeStyle = config.lineColor;
							}
							ctx.stroke();
						}
					}
				}
			}

			for (let i = 0; i < points.length; i++) {
				points[i].update();
				points[i].draw(ctx);
			}
			animationFrameId = requestAnimationFrame(animate);
		};

		const handleMouseMove = (e) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
		};
		const handleMouseOut = () => {
			mouse.x = null;
			mouse.y = null;
		};

		init();
		animate();
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseout', handleMouseOut);
		window.addEventListener('resize', init);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseout', handleMouseOut);
			window.removeEventListener('resize', init);
			cancelAnimationFrame(animationFrameId);
		};
	});
</script>

<canvas bind:this={canvasEl} class="fixed left-0 top-0 -z-10 h-full w-full"></canvas>