// グローバル変数ズ
let inputFile = document.getElementById('inputFile');
let load_Element = document.getElementById('load_Image');
let result_Element = document.getElementById('result_Image');

// getContent Pointer
let ctx_load = load_Element.getContext('2d');
let ctx_result = result_Element.getContext('2d');

// HSV画像用の疑似Imgオブジェクト
// のグローバル変数
let hsv_Img = null;
let result_hsv = null;

// loadしたImageのObjectPointer
let load_Image = null;

// loadしたImageのDataPointer
let load_ImageData = null;

// 表示するImageのDataPointer
let result_ImageData = null;

// 最大画像サイズ
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 1000;

/*
	EventListener
	id:inputFile に変化があった際に第二引数のfuncを実行する
	1st:発動条件 2nd:func 3rd:Event伝搬の方式(default:false)
*/
inputFile.addEventListener('change', loadImageFile, false);

/*
	inputFileのEventListenerで実行されるfunc
	param:e <- unknown
*/
function loadImageFile(e){
	console.log("func loadImageFile: running");
	let fileData = e.target.files[0];
	
	// Image以外のデータ形式のファイルが入れられたときの例外処理
	if(!fileData.type.match('image/*')){
		console.log("func loadImageFile: ERROR!! InputFile is not image file.");
		alert("画像を選択してください");
		return;
	}
	
	// ImageをfileDataから読み出す
	let reader = new FileReader();
	// 読み込んだ後の処理
	reader.onload = function(){
		console.log("func loadImageFile: reader.onload running");
		load_Image = new Image();
		load_Image.onload = function(){
			console.log("func loadImageFile: load_Image.onload running");
			let height = this.height;
			let width = this.width;
			if(getCheckboxCompress() && (height > MAX_HEIGHT || width > MAX_WIDTH)){
				if(height < width){
					let ratio = height / width;
					width = MAX_WIDTH;
					height = MAX_WIDTH * ratio;
				}else{
					let ratio = width / height;
					width = MAX_HEIGHT * ratio;
					height = MAX_HEIGHT;
				}
			}
			load_Element.height = result_Element.height = height;
			load_Element.width = result_Element.width = width;
			ctx_load.drawImage(this, 0, 0, this.width, this.height, 0, 0, width, height);
			hsv_Img = new HSV_Image(load_ImageData = ctx_load.getImageData(0, 0, width, height));
			console.log("Obj HSV_Img: set up Complete");
			console.log("func loadImageFile: load_Image.onload finished");
		}
		load_Image.src = this.result;
		// この状態のload_Imageはbase64で記述されている
		console.log("func loadImageFile: reader.onload finished");
	}
	// 読み込ませる
	reader.readAsDataURL(fileData);
	console.log("func loadImageFile: finished");
}

/*
	processボタンが押下された際の処理
	EventListenerは必要無し(htmlに直接記述されている)
*/
function process(){
	console.log("+-----func process---------+");
	console.log("func process: running");
	
	// マスク作成
	console.log("func process: result_ImageData outputing");
	result_ImageData = new ImageData(hsv_Img.height, hsv_Img.width);
	console.log("func process: result_ImageData outputed");
	
	// で描画
	
	result_ImageData.onload = function(){
		alert("func process: result_ImageData.onload");
		console.log("func process: result_ImageData.onload");
		ctx_result.putImageData(this, 0, 0);
		console.log("func process: result_ImageData.onload");
	}
	// NTD(makeMask());
	NTD_1(makeMask()).then(NTD_2());
	
	console.log("func process: finished");
	console.log("+-----func process-end-----+");
}

/*
	引数のImageからマスク画像を生成する
	途中で，HTML上のスライダーから値を取得する
	param:void
	return:Array Object(Mask)
*/
function makeMask(){
	let mask = new Array(hsv_Img.height * hsv_Img.width);
	let hsv_Img_data_length = hsv_Img.data.length;
	let s_slider_value = getSliderS();
	let v_slider_value = getSliderV();
	for(let i = 0; i < hsv_Img_data_length; i += 4){
		if(hsv_Img.data[i] < 30 || 330 < hsv_Img.data[i]){
			if(hsv_Img.data[i+1] > s_slider_value && hsv_Img.data[i+2] > v_slider_value){
				mask[Math.floor(i/4)] = 1;
			}else{
				mask[Math.floor(i/4)] = 0;
			}
		}else{
			mask[Math.floor(i/4)] = 0;
		}
	}
	return mask;
}

/*
	maskとHSVから結果画像(RGB)を生成
	param:mask
	return:ImageData Object
*/
function NTD(mask){
	console.log("func NTD: running");
	// マスクとHSV元画像を用意する
	// マスクとHSV元画像からHSV修正画像を生成
	// HSV修正画像をRGB画像に変換
	
	// RGB画像をreturn
	NTD_1(mask).then(NTD_2());
	console.log("func NTD: finished");
}
function NTD_1(mask){
	return new Promise((resolve, reject)=>{
		result_hsv = new HSV_Image(hsv_Img.height, hsv_Img.width);
		let DV_value = getSliderDV() / 100;
		let result_hsv_data_length = result_hsv.data.length;
		for(let i = 0; i < result_hsv_data_length; i += 4){
			result_hsv.data[i] = hsv_Img.data[i];
			result_hsv.data[i+1] = hsv_Img.data[i+1];
			result_hsv.data[i+3] = hsv_Img.data[i+3];
			if(mask[Math.floor(i/4)] == 1){
				result_hsv.data[i+2] = hsv_Img.data[i+2] + DV_value;
			}else{
				result_hsv.data[i+2] = hsv_Img.data[i+2] - DV_value;
			}
		}
	});
}
function NTD_2(){
	return new Promise((resolve, reject)=>{
		let pic = new ImageData(new Uint8ClampedArray(result_hsv.toRGB()), result_hsv.width, result_hsv.height);
		ctx_result.putImageData(pic, 0, 0);
	});
}
/*
	sスライダーの取得後，HTMLの書き換え
*/
$("input[id='s-slider']").on("input", function(e){
	let range = e.target;
	$(".s-slider_value").text(range.value);
});

/*
	sスライダーの取得後，その値をreturn
*/
function getSliderS(){
	return document.getElementById("s-slider").value;
}

/*
	vスライダーの取得後，HTMLを書き換え
*/
$("input[id='v-slider']").on("input", function(e){
	let range = e.target;
	$(".v-slider_value").text(range.value)
});

/*
	vスライダーの取得後，その値をreturn
*/
function getSliderV(){
	return document.getElementById("v-slider").value;
}

/*
	dVスライダーの取得後，HTMLを書き換え
*/
$("input[id='dV-slider']").on("input", function(e){
	let range = e.target;
	$(".dV-slider_value").text(range.value)
});

/*
	dVスライダーの取得後，その値をreturn
*/
function getSliderDV(){
	return document.getElementById("dV-slider").value;
}

/*
	画像圧縮checkboxの結果を返す
*/
function getCheckboxCompress(){
	return $("#compress").prop('checked');
}

/*
	画像圧縮checkboxが変更されたらcanvasをまっさらに
	あと各ImageDataの初期化
*/
$("input[id='compress']").change("input", function(e){
	AllReset();
});

/*
	Resetボタンを押下した際に実行されるfunc
	id:result_Imageのcanvasの中身を全てnullに
	全部nullに
	canvasのサイズも300*150(デフォルト)に
*/
function AllReset(){
	ctx_load.clearRect(0, 0, load_Element.width, load_Element.height);
	ctx_result.clearRect(0, 0, result_Element.width, result_Element.height);
	hsv_Img = result_hsv = null;
	load_Image = load_ImageData = result_ImageData = null;
	load_Element.height = result_Element.height = 150;
	load_Element.width = result_Element.width = 300;
	console.log("func AllReset: ALL RESET");
}