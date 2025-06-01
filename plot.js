const canvas = document.getElementById('functionCanvas');
const ctx = canvas.getContext('2d');
const inputField = document.getElementById('functionInput');

let xMin = -10, xMax = 10;
let yMin = -2, yMax = 2;

document.getElementById('plotButton').addEventListener('click', plotCurrent);
document.getElementById('zoomInButton').addEventListener('click', function() {
    zoom(1 / 1.5);
});
document.getElementById('zoomOutButton').addEventListener('click', function() {
    zoom(1.5);
});

function plotCurrent() {
    let input = inputField.value.trim();
    input = input.replace(/^\s*y\s*=\s*/i, '');
    if (!input) return;
    drawFunction(input);
}

// 鼠标拖动
let isDragging = false;
let lastX = 0, lastY = 0;
let dragStartXMin, dragStartXMax, dragStartYMin, dragStartYMax;

canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    dragStartXMin = xMin;
    dragStartXMax = xMax;
    dragStartYMin = yMin;
    dragStartYMax = yMax;
});
canvas.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const width = canvas.width;
    const height = canvas.height;
    const dx = e.offsetX - lastX;
    const dy = e.offsetY - lastY;
    const xRange = dragStartXMax - dragStartXMin;
    const yRange = dragStartYMax - dragStartYMin;
    xMin = dragStartXMin - dx * xRange / width;
    xMax = dragStartXMax - dx * xRange / width;
    yMin = dragStartYMin + dy * yRange / height;
    yMax = dragStartYMax + dy * yRange / height;
    plotCurrent();
});
canvas.addEventListener('mouseup', function() {
    isDragging = false;
});
canvas.addEventListener('mouseleave', function() {
    isDragging = false;
});

// 鼠标滚轮缩放
canvas.addEventListener('wheel', function(e) {
    e.preventDefault();
    // 只在canvas上滚动时缩放
    const scale = e.deltaY < 0 ? 1 / 1.2 : 1.2;
    // 以鼠标位置为中心缩放
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const x = xMin + (xMax - xMin) * (px / canvas.width);
    const y = yMax - (yMax - yMin) * (py / canvas.height);
    zoom(scale, x, y);
}, { passive: false });

function zoom(scale, centerX, centerY) {
    // 默认以中心缩放
    if (centerX === undefined) centerX = (xMin + xMax) / 2;
    if (centerY === undefined) centerY = (yMin + yMax) / 2;
    const xRange = (xMax - xMin) * scale;
    const yRange = (yMax - yMin) * scale;
    xMin = centerX - xRange / 2;
    xMax = centerX + xRange / 2;
    yMin = centerY - yRange / 2;
    yMax = centerY + yRange / 2;
    plotCurrent();
}

// 触摸事件支持（移动端拖动+缩放）
let lastTouchDist = null;
let lastTouchCenter = null;
canvas.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.touches[0].clientX - rect.left;
        lastY = e.touches[0].clientY - rect.top;
        dragStartXMin = xMin;
        dragStartXMax = xMax;
        dragStartYMin = yMin;
        dragStartYMax = yMax;
    } else if (e.touches.length === 2) {
        isDragging = false;
        lastTouchDist = getTouchDist(e);
        lastTouchCenter = getTouchCenter(e, canvas);
        dragStartXMin = xMin;
        dragStartXMax = xMax;
        dragStartYMin = yMin;
        dragStartYMax = yMax;
    }
});
canvas.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1 && isDragging) {
        const rect = canvas.getBoundingClientRect();
        const width = canvas.width;
        const height = canvas.height;
        const curX = e.touches[0].clientX - rect.left;
        const curY = e.touches[0].clientY - rect.top;
        const dx = curX - lastX;
        const dy = curY - lastY;
        const xRange = dragStartXMax - dragStartXMin;
        const yRange = dragStartYMax - dragStartYMin;
        xMin = dragStartXMin - dx * xRange / width;
        xMax = dragStartXMax - dx * xRange / width;
        yMin = dragStartYMin + dy * yRange / height;
        yMax = dragStartYMax + dy * yRange / height;
        plotCurrent();
        e.preventDefault();
    } else if (e.touches.length === 2) {
        // 双指缩放
        const newDist = getTouchDist(e);
        const scale = lastTouchDist / newDist;
        const center = getTouchCenter(e, canvas);
        // 以双指中心为缩放中心
        zoom(scale, center.x, center.y);
        e.preventDefault();
    }
}, { passive: false });
canvas.addEventListener('touchend', function(e) {
    isDragging = false;
    lastTouchDist = null;
    lastTouchCenter = null;
});
canvas.addEventListener('touchcancel', function() {
    isDragging = false;
    lastTouchDist = null;
    lastTouchCenter = null;
});

function getTouchDist(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
function getTouchCenter(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
    const y = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;
    // 转换为数学坐标
    const mathX = xMin + (xMax - xMin) * (x / canvas.width);
    const mathY = yMax - (yMax - yMin) * (y / canvas.height);
    return { x: mathX, y: mathY };
}

function drawFunction(expr) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;

    // 绘制坐标轴
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // x轴
    const y0 = height - ((0 - yMin) / (yMax - yMin)) * height;
    ctx.moveTo(0, y0);
    ctx.lineTo(width, y0);
    // y轴
    const x0 = ((0 - xMin) / (xMax - xMin)) * width;
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, height);
    ctx.stroke();

    // 绘制刻度和数字
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // x轴刻度
    let xStep = getStep(xMin, xMax, 10);
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        const px = ((x - xMin) / (xMax - xMin)) * width;
        ctx.beginPath();
        ctx.moveTo(px, y0 - 5);
        ctx.lineTo(px, y0 + 5);
        ctx.stroke();
        ctx.fillText(x.toFixed(1), px, y0 + 8);
    }

    // y轴刻度
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    let yStep = getStep(yMin, yMax, 8);
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        const py = height - ((y - yMin) / (yMax - yMin)) * height;
        ctx.beginPath();
        ctx.moveTo(x0 - 5, py);
        ctx.lineTo(x0 + 5, py);
        ctx.stroke();
        if (Math.abs(y) > 1e-8)
            ctx.fillText(y.toFixed(1), x0 - 8, py);
    }

    // 解析表达式
    let compiled;
    try {
        compiled = math.compile(expr);
    } catch (e) {
        alert('表达式有误，请检查输入！');
        return;
    }

    // 绘制函数曲线
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let px = 0; px <= width; px++) {
        const x = xMin + (xMax - xMin) * (px / width);
        let y;
        try {
            y = compiled.evaluate({x});
        } catch {
            continue;
        }
        if (typeof y !== 'number' || !isFinite(y)) continue;
        const py = height - ((y - yMin) / (yMax - yMin)) * height;
        if (first) {
            ctx.moveTo(px, py);
            first = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}

// 计算合适的刻度间隔
function getStep(min, max, count) {
    const rawStep = (max - min) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const norm = rawStep / mag;
    let step;
    if (norm < 2) step = 1;
    else if (norm < 5) step = 2;
    else step = 5;
    return step * mag;
}

// 页面加载后自动绘制一次
plotCurrent();