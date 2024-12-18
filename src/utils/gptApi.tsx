import axios from 'axios';

const generateSupplementDescription = async (supplementInfo: {
  coreIngredients: string;
  efficacy: string;
  precautions: string;
}): Promise<string> => {
  const { coreIngredients, efficacy} = supplementInfo;
  console.log("주요 성분:", coreIngredients);
  console.log("효능:", efficacy);
  const prompt = `
  다음은 사용자가 찾은 영양제에 대한 정보입니다:
  - 주요 성분: ${coreIngredients}
  - 효능: ${efficacy}

  위 정보를 바탕으로 아래 질문에 답변해주세요:
  1. 이 영양제의 주요 성분을 알려주세요.
  2. 핵심 성분의 함량이 무엇이고 하루 평균치의 몇 %인지 알려주세요.
  3. 이 영양제의 효능을 쉽게 설명해주세요.
  4. 어떤 사람에게 이 영양제가 적합한지 설명해주세요.
  
  단, "이 영양제의 주요 성분 중 함량이 가장 높은 상위 2가지를 중심으로 알려주세요. 나머지는 언급하지 않아도 됩니다."
  명확하고 구체적으로 답변 부탁드립니다.
  `;

  try {
    const response = await axios.post('http://localhost:5000/api/generate', {
      prompt,
    });
    return response.data.content || '응답이 비어 있습니다.';
  } catch (error) {
    console.error('Error fetching supplement description:', error);
    return '응답 생성에 실패했습니다.';
  }
  
};


export default generateSupplementDescription;
