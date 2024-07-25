import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { Articles } from '../components';
import {
	getArticle,
	getBase64Image,
	imageSrc
} from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const Article = () => {
	const params = useParams();
	const articleId = Number(params.article_id);
	const [article, setArticle] = useState({});
	const [base64Image, setBase64Image] = useState('');
	const { showBoundary } = useErrorBoundary();
	const loading_context = useContext(LoadingContext);

	useEffect(() => {
		const getData = async () => {
			loading_context.setLoading(true);

			var articleData;
			try {
				articleData = await getArticle(articleId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (articleData) {
				var base64ImageData;
				try {
					base64ImageData = await getBase64Image({ table: 'articles', image_id: articleId });
				} catch (err) {
					showBoundary(err);
					return ;
				}
				setArticle(articleData);
				setBase64Image(base64ImageData);
			} else {
				window.alert('商品が存在しません');
				loading_context.setLoading(false);
				window.location.href = '/articles';
				return ;
			}

			loading_context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div className='w-3/4 my-16 mx-auto'>
			<div className='mb-32'>
				<img
					src={imageSrc(base64Image)}
					alt='商品画像'
					className='sm:w-3/4 mx-auto mt-32 mb-16 aspect-[3/2] object-contain' />
				<p className='mb-2 text-2xl font-bold'>{article.title}</p>
				<p className='mb-12 text-stone-500 text-sm'>{article.created_at}</p>
				<p className='whitespace-pre-line'>{article.content}</p>
			</div>
			<Articles />
		</div>
	);
};

export default Article;
