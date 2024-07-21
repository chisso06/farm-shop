const validateReview = (review) => {
	var message = '';

	if (isNaN(Number(review.score)) || !review.score || review.score > 5)
		message = '満足度を1〜5の半角数字で入力してください';
	else if ((typeof review.title) !== 'string' || !review.title || review.title.length > 20)
		message = 'タイトルを20字以内で入力してください';
	else if ((typeof review.nickname) !== 'string' || !review.nickname || review.nickname.length > 20)
		message = 'ニックネームを20字以内で入力してください';
	else if ((typeof review.content) !== 'string' || !review.content || review.content.length > 1000)
		message = '本文を1000字以内で入力してください';

	return message;
};

export default validateReview;