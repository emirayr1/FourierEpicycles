let path, length, points = [];
let fourierX;
let time = 0;
let pathDrawing = [];


function setup() {
    createCanvas(700, 700);

    // SVG'deki path elementini seç
    path = document.getElementById("e-path");
    length = path.getTotalLength(); // Path'in toplam uzunluğunu al

    // Path üzerindeki noktaları topla
    let numPoints = 200;  // İstediğin çözünürlükte nokta sayısı
    for (let i = 0; i < numPoints; i++) {
        let pt = path.getPointAtLength((i / numPoints) * length);
        points.push(createVector(pt.x, pt.y));
    }

    // Fourier dönüşümü hesapla ve çiz
    fourierX = dft(points);
    fourierX.sort((a, b) => b.amp - a.amp); // En büyükten küçüğe doğru sıralama
}

function draw() {
    background(255);


    let v = epicycles(width / 2, height / 2, 0, fourierX);

    pathDrawing.unshift(v); // Yeni noktayı başa ekle

    // Çizilen noktaları göster
    beginShape();
    noFill();
    for (let i = 0; i < pathDrawing.length; i++) {
        vertex(pathDrawing[i].x, pathDrawing[i].y);
    }
    endShape();

    // Zamanı güncelle
    const dt = TWO_PI / fourierX.length;
    time += dt;
    if (time > TWO_PI) {
        time = 0;
        pathDrawing = [];
    }
}

// DFT (Discrete Fourier Transform) fonksiyonu
function dft(x) {
    let X = [];
    const N = x.length;
    for (let k = 0; k < N; k++) {
        let re = 0;
        let im = 0;
        for (let n = 0; n < N; n++) {
            const phi = (TWO_PI * k * n) / N;
            re += x[n].x * cos(phi) + x[n].y * sin(phi);
            im += -x[n].x * sin(phi) + x[n].y * cos(phi);
        }
        re = re / N;
        im = im / N;
        let freq = k;
        let amp = sqrt(re * re + im * im);
        let phase = atan2(im, re);
        X[k] = { re, im, freq, amp, phase };
    }
    return X;
}

// Epicycle fonksiyonu
function epicycles(x, y, rotation, fourier) {
    for (let i = 0; i < fourier.length; i++) {
        let prevx = x;
        let prevy = y;
        let freq = fourier[i].freq;
        let radius = fourier[i].amp;
        let phase = fourier[i].phase;
        x += radius * cos(freq * time + phase + rotation);
        y += radius * sin(freq * time + phase + rotation);

        stroke(0, 100);
        noFill();
        ellipse(prevx, prevy, radius * 2);

        stroke(0);
        line(prevx, prevy, x, y);
    }
    return createVector(x, y);
}
