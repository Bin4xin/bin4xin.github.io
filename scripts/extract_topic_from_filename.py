import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.probability import FreqDist
import os
import re


def count_md_files(folder_path):
    md_file_count = 0
    all_title_keywords_list = []
    all_content_keywords_list = []

    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".md") or file.endswith(".markdown"):
                md_file_path = os.path.join(root, file)
                md_file_count += 1
                with open(md_file_path, 'r') as f:
                    content = f.read()
                    researchname_match = re.search(r'Researchname:\s*(.+)', content)
                    title_match = re.search(r'title:\s*(.+)', content)
                    if researchname_match:
                        researchname = researchname_match.group(1)
                        markdown_title = researchname
                    elif title_match:
                        title = title_match.group(1)
                        markdown_title = title
                    else:
                        print(f"{md_file_path}: Researchname or title not found in the file.")
                markdown_content = content

                # 文本预处理
                stop_words = set(stopwords.words('chinese'))  # 替换为适当的语言
                title_tokens = word_tokenize(markdown_title)
                content_tokens = word_tokenize(markdown_content)

                title_tokens = [word.lower() for word in title_tokens if word.isalnum() and word.lower() not in stop_words]
                content_tokens = [word.lower() for word in content_tokens if word.isalnum() and word.lower() not in stop_words]

                # 关键词提取
                title_keywords = FreqDist(title_tokens).most_common(3)
                content_keywords = FreqDist(content_tokens).most_common(3)

                # 合并为列表
                title_keywords_list = [item[0] for item in title_keywords]
                content_keywords_list = [item[0] for item in content_keywords]

                # 存储结果
                all_title_keywords_list.append(title_keywords_list)
                all_content_keywords_list.append(content_keywords_list)
    print(all_title_keywords_list)
    print(all_content_keywords_list)
    # 打印所有结果
    # for i, (title_keywords, content_keywords) in enumerate(zip(all_title_keywords_list, all_content_keywords_list), start=1):
    #     print(f"File {i} - 标题关键词: {title_keywords}")
    #     print(f"File {i} - 内容关键词: {content_keywords}")

    print(f"Total number of .md/.markdown files: {md_file_count}")


# 用法示例
markdown_file_dir = "/Users/bin4xin/blog/github-code/bin4xin.github.io/_posts/top/"
count_md_files(markdown_file_dir)
