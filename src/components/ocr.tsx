import React, { useRef, useState } from 'react';
import { Camera, CameraType } from 'react-camera-pro';
import analyzeImage from '../utils/visionApi';
import { fetchMatchedSupplementData } from '../utils/supplementApi';
import { formatSupplementInfo } from '../utils/formatSupplementInfo';
import generateSupplementDescription from '../utils/gptApi';

const CameraComponent: React.FC = () => {
    const cameraRef = useRef<CameraType>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [supplementData, setSupplementData] = useState<any | null>(null);
    const [productName, setProductName] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedInfo, setGeneratedInfo] = useState<string | null>(null);

    const takePictureAndAnalyze = async () => {
        if (cameraRef.current) {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                setSupplementData(null);
                setProductName(null);
                setGeneratedInfo(null);

                // Step 1: 사진 촬영 및 OCR 처리
                const image = cameraRef.current.takePhoto() as string;
                const base64Image = image.split(',')[1]; // Base64 데이터만 추출
                if (!base64Image) {
                    throw new Error('캡처된 이미지가 올바르지 않습니다.');
                }
                const ocrText = await analyzeImage(base64Image);
                setAnalysisResult(ocrText); //ocr 결과

                // Step 2: Open API와 매칭
                const matchedProduct = await fetchMatchedSupplementData(ocrText);
                
                // Step 2-1: 제품 이름 추출 및 저장
                if (matchedProduct?.PRDLST_NM) {
                    setProductName(matchedProduct.PRDLST_NM);
                }

               // Step 3: 데이터 가공
               const supplementInfo = formatSupplementInfo(matchedProduct);
               setSupplementData(supplementInfo);

               // Step 4: GPT 호출로 자연어 문장 생성
               const gptResult = await generateSupplementDescription(supplementInfo);
               setGeneratedInfo(gptResult); // GPT 결과 저장
            } catch (error) {
                console.error('Analysis failed:', error);
                setErrorMessage('이미지 분석에 실패했습니다. 다시 시도해주세요.');
            }finally {
                setIsLoading(false);
            }
        } else {
            setErrorMessage('카메라가 준비되지 않았습니다.');
        }
    };

    return (
        <div>
            <Camera ref={cameraRef} aspectRatio={1} facingMode="environment"
                    errorMessages={{
                        noCameraAccessible: "카메라에 접근할 수 없습니다.",
                        permissionDenied: "카메라 권한이 거부되었습니다.",
                        switchCamera: "카메라 전환에 실패했습니다.",
                        canvas: "캔버스 오류가 발생했습니다.",
                      }}
            />
            {<button onClick={takePictureAndAnalyze} disabled={isLoading}>
            {isLoading ? '분석 중...' : 'Analyze'}
            </button>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {analysisResult && <p> 영양제 제품 인식: {analysisResult}</p>}
            {supplementData && (
                <div>
                    <h3>영양제 정보:</h3>
                    <p>제품명: {productName}</p>
                    <p>주요 성분: {supplementData.coreIngredients || '데이터 없음'}</p>
                    <p>효능: {supplementData.efficacy || '데이터 없음'}</p>
                    <p>복용 주의사항: {supplementData.precautions || '데이터 없음'}</p>
                </div>
            )}
            {generatedInfo && (
                <div>
                    <h3>분석 결과:</h3>
                    <p>{generatedInfo}</p>
                </div>
            )}
        </div>
    );
};

export default CameraComponent;
