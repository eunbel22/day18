import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze_feedback():
    try:
        data = request.get_json()
        feedback = data.get('feedback', '').strip()

        if not feedback:
            return jsonify({'error': '피드백을 입력해주세요'}), 400

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return jsonify({'error': 'API 키가 설정되지 않았습니다'}), 500

        client = genai.Client(api_key=api_key)
        prompt = (
            "다음 고객 피드백을 분석하여 아래 계약에 따라 정확히 출력해주세요:\n"
            "1. 유형: 버그 / 기능 요청 / 문의 중 하나\n"
            "2. 긴급도: 높음 / 중간 / 낮음 중 하나\n"
            "3. 판단 이유: 한 문장\n"
            "4. 다음 행동: 한 문장\n\n"
            f"고객 피드백: {feedback}"
        )

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )

        return jsonify({'result': response.text}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

if __name__ == "__main__":
    app.run(debug=True)
