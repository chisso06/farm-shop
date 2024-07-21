const validateNews = (news) => {
	var message = '';

	if ((typeof news.content) !== 'string' || !news.content || news.content.length > 100)
		message = '本文を100字以内で入力してください';

	return message;
};

export default validateNews;