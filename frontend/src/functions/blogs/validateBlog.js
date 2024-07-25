const validateBlog = (blog) => {
	var message = '';

	if ((typeof blog.title) !== 'string' || !blog.title || blog.title.length > 100)
		message = 'タイトルを100字以内で入力してください';
	else if ((typeof blog.content) !== 'string' || !blog.content || blog.content.length > 10000)
		message = '本文を10000字以内で入力してください';

	return message;
};

export default validateBlog;