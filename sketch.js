// 圖片精靈變數
let stopSprite, walkSprite, magicSprite, effectSprite;
let currentAction = 'stop'; // 狀態: 'stop', 'walkRight', 'walkLeft', 'magic'

// 角色位置與移動速度
let posX;
let speed = 4;
let facingRight = true; // 記錄角色目前面向的方向 (true: 右, false: 左)

// 靜止狀態 (1/stop/stop.png) - 8張，寬 1043, 高 108
let stopTotalFrames = 8;
let stopFrame = 0;
let stopTotalWidth = 1043;
let stopHeight = 108;

// 走路狀態 (1/walk/walk.png) - 9張，寬 1246, 高 198[cite: 1]
let walkTotalFrames = 9;
let walkFrame = 0;
let walkTotalWidth = 1246;
let walkHeight = 198;

// 魔法施放狀態 (1/magic/magic.png) - 7張，寬 870, 高 85
let magicTotalFrames = 7;
let magicFrame = 0;
let magicTotalWidth = 870;
let magicHeight = 85;
let isMagicPlaying = false; // 是否正在施放魔法

// 魔法特效狀態 (1/magic_effect/magic_effect.png) - 4張，寬 475, 高 40
let effectActive = false;     // 特效是否正在飛行
let effectX = 0;              // 特效目前 X 座標
let effectY = 0;              // 特效 Y 座標
let effectDir = 1;            // 特效方向 (1: 往右, -1: 往左)
let effectTotalFrames = 4;
let effectFrame = 0;
let effectTotalWidth = 475;
let effectHeight = 40;
let effectSpeed = 8;          // 特效飛行速度

// 動畫播放速度控制
let frameDelay = 6;
let frameCounter = 0;

function preload() {
  // 載入所有精靈圖片
  stopSprite = loadImage('1/stop/stop.png');
  walkSprite = loadImage('1/walk/walk.png');
  magicSprite = loadImage('1/magic/magic.png');
  effectSprite = loadImage('1/magic_effect/magic_effect.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  
  // 初始位置設定在畫布 2/3 處
  posX = (width * 2) / 3;
}

function draw() {
  // 設定淡粉色背景
  background(255, 228, 230);
  
  // --- 1. 鍵盤控制與移動邏輯 ---
  let targetHeight = height / 3;
  let targetWidth;
  
  // 根據圖片比例先計算出角色寬度，以便做邊界限制
  let sW_temp, sH_temp;
  if (currentAction === 'stop') {
    sW_temp = stopTotalWidth / stopTotalFrames;
    sH_temp = stopHeight;
  } else if (currentAction === 'walkRight' || currentAction === 'walkLeft') {
    sW_temp = walkTotalWidth / walkTotalFrames;
    sH_temp = walkHeight;
  } else if (currentAction === 'magic') {
    sW_temp = magicTotalWidth / magicTotalFrames;
    sH_temp = magicHeight;
  }
  targetWidth = targetHeight * (sW_temp / sH_temp);

  // 如果沒有在放魔法，才接受左右鍵移動與邊界限制
  if (!isMagicPlaying) {
    if (keyIsDown(RIGHT_ARROW)) {
      currentAction = 'walkRight';
      facingRight = true;
      posX += speed;
    } else if (keyIsDown(LEFT_ARROW)) {
      currentAction = 'walkLeft';
      facingRight = false;
      posX -= speed;
    } else {
      currentAction = 'stop';
    }
  }
  
  // 限制角色移動到畫布最左端與最右端即停止移動，但動畫繼續播放
  posX = constrain(posX, 0, width - targetWidth);
  
  // --- 2. 決定當前繪製的精靈參數 ---
  let totalFrames, currentFrameIndex, sWidth, sHeight, spriteImg;
  
  if (currentAction === 'stop') {
    totalFrames = stopTotalFrames;
    currentFrameIndex = stopFrame;
    sWidth = stopTotalWidth / stopTotalFrames;
    sHeight = stopHeight;
    spriteImg = stopSprite;
  } else if (currentAction === 'walkRight' || currentAction === 'walkLeft') {
    totalFrames = walkTotalFrames;
    currentFrameIndex = walkFrame;
    sWidth = walkTotalWidth / walkTotalFrames;
    sHeight = walkHeight;
    spriteImg = walkSprite;
  } else if (currentAction === 'magic') {
    totalFrames = magicTotalFrames;
    currentFrameIndex = magicFrame;
    sWidth = magicTotalWidth / magicTotalFrames;
    sHeight = magicHeight;
    spriteImg = magicSprite;
  }
  
  // --- 3. 繪製角色精靈 ---
  if (spriteImg && spriteImg.width > 0) {
    let sx = Math.floor(currentFrameIndex * sWidth);
    let sy = 0;
    let sw = Math.floor(sWidth);
    let sh = sHeight;
    let targetY = height - targetHeight; // 底部貼齊畫布最下方
    
    push();
    // 判斷是否需要水平鏡射翻轉（走路向左或施法面向左）
    let shouldFlip = (currentAction === 'walkLeft') || (currentAction === 'magic' && !facingRight);
    if (shouldFlip) {
      translate(posX + targetWidth / 2, targetY);
      scale(-1, 1);
      image(spriteImg, -targetWidth / 2, 0, targetWidth, targetHeight, sx, sy, sw, sh);
    } else {
      image(spriteImg, posX, targetY, targetWidth, targetHeight, sx, sy, sw, sh);
    }
    pop();
  }
  
  // --- 4. 處理魔法特效的移動與顯示 ---
  if (effectActive) {
    let effSingleW = effectTotalWidth / effectTotalFrames;
    let effAspect = effSingleW / effectHeight;
    let effHeight = height / 6; // 特效高度為畫布 1/6
    let effWidth = effHeight * effAspect;
    
    // 移動特效位置
    effectX += effectSpeed * effectDir;
    
    // 繪製特效精靈
    if (effectSprite && effectSprite.width > 0) {
      let esx = Math.floor(effectFrame * effSingleW);
      let esw = Math.floor(effSingleW);
      
      push();
      if (effectDir === -1) {
        translate(effectX + effWidth / 2, effectY);
        scale(-1, 1);
        image(effectSprite, -effWidth / 2, 0, effWidth, effHeight, esx, 0, esw, effectHeight);
      } else {
        image(effectSprite, effectX, effectY, effWidth, effHeight, esx, 0, esw, effectHeight);
      }
      pop();
    }
    
    // 檢查特效是否超出畫布邊緣（右端或左端），超出即消失
    if (effectX > width || effectX + effWidth < 0) {
      effectActive = false;
    }
  }
  
  // --- 5. 動畫影格計數更新 ---
  frameCounter++;
  if (frameCounter >= frameDelay) {
    // 角色動畫更新
    if (currentAction === 'stop') {
      stopFrame = (stopFrame + 1) % stopTotalFrames;
    } else if (currentAction === 'walkRight' || currentAction === 'walkLeft') {
      walkFrame = (walkFrame + 1) % walkTotalFrames;
    } else if (currentAction === 'magic') {
      magicFrame++;
      // 魔法動畫「執行一次就好」
      if (magicFrame >= magicTotalFrames) {
        magicFrame = 0;
        isMagicPlaying = false;
        currentAction = 'stop'; // 播放完畢回到靜止狀態
        
        // 魔法播放完畢瞬間，發射特效！
        effectActive = true;
        effectY = height - targetHeight + (targetHeight / 3);
        if (facingRight) {
          effectDir = 1;
          effectX = posX + targetWidth; // 從角色右側出發往右飛
        } else {
          effectDir = -1;
          effectX = posX; // 從角色左側出發往左飛
        }
      }
    }
    
    // 特效動畫循環播放
    if (effectActive) {
      effectFrame = (effectFrame + 1) % effectTotalFrames;
    }
    
    frameCounter = 0;
  }
}

// 偵測按下空白鍵觸發魔法
function keyPressed() {
  if (key === ' ' && !isMagicPlaying) {
    isMagicPlaying = true;
    currentAction = 'magic';
    magicFrame = 0;
  }
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}