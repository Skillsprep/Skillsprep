import re
import json

def parse_questions(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = []
    # Split by double newline to get each question block
    blocks = content.strip().split('\n\n')

    for block in blocks:
        lines = block.split('\n')

        # Extract Question number/text
        q_line = lines[0].strip()
        q_num = re.search(r'Question (\d+)', q_line)
        if not q_num:
            continue
        q_id = int(q_num.group(1))

        # The question text can span multiple lines. We'll read until we hit the choices (starting with "1.")
        question_text = ""
        choices = []
        answer = ""

        idx = 1
        while idx < len(lines):
            line = lines[idx].strip()
            if line.startswith("1."):
                break
            if line:
                question_text += line + " "
            idx += 1

        question_text = question_text.strip()

        # Now extract choices and answer
        while idx < len(lines):
            line = lines[idx].strip()
            if line.startswith("Answer:"):
                answer = line.split("Answer:")[1].strip()
            elif re.match(r'^\d+\.', line):
                choices.append(line)
            idx += 1

        questions.append({
            "id": q_id,
            "question": question_text,
            "choices": choices,
            "answer": answer
        })

    return questions

if __name__ == '__main__':
    data = parse_questions('questions.txt')
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
    print(f"Successfully parsed {len(data)} questions into data.json")
