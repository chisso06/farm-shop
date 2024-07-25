const validateArticle = (article) => {
	var message = '';

	if ((typeof article.title) !== 'string' || !article.title || article.title.length > 100)
		message = 'タイトルを100字以内で入力してください';
	else if ((typeof article.content) !== 'string' || !article.content || article.content.length > 10000)
		message = '本文を10000字以内で入力してください';

	return message;
};

export default validateArticle;
