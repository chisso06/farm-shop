import { React } from 'react';

const ErrorPage = () => {
	// throw new Error("Contact Page Error");
	return (
		<div className='my-16'>
			<div className='pt-8 h-screen'>
				<p className='mb-2 text-center'>エラーが発生しました</p>
				<p className='text-center underline hover:text-amber-600'><a href='/'>トップへ戻る</a></p>
			</div>
		</div>
	);
};

export default ErrorPage;
