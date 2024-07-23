import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from "react-error-boundary";
import { useNavigate } from 'react-router-dom';
import { getArticles, getIndexBase64Images, imageSrc } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const Articles = () => {
	const [articles, setArticles] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);
	const navigate = useNavigate();

	const handleClick = (e, articleId) => {
		e.preventDefault();
		navigate(`/articles/${articleId}`);
	}

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var articlesData;
			var base64ImagesData;
			try {
				articlesData = await getArticles();
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (!articlesData) {
				context.setLoading(false);
				return ;
			}
			try {
				base64ImagesData = await getIndexBase64Images({ table: 'articles', objects: articlesData });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setArticles(articlesData);
			setBase64Images(base64ImagesData);
			context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div className='my-20'>
			<ul className='mb-20 grid sm:grid-cols-3' >{
				articles.length ? articles.map((article, i) => {
					return (
						<li key={i} className='hover:opacity-60'>
							<a
								// onClick={(e) => handleClick(e, article.id)}
								href={'/articles/' + article.id}
								className='relative aspect-video block' >
								<img
									src={imageSrc(base64Images[article.base64Images_idx])}
									alt='goods'
									className='aspect-video object-cover' />
								<div className='absolute px-4 w-full h-full top-0 flex items-center bg-stone-900 bg-opacity-50 text-white hover:bg-white hover:bg-opacity-50 hover:text-black hover:text-lg'>
									<p>
										{ article.title && article.title.length <= 14 ? 
											article.title : article.title.substring(0, 13) + '…' }
									</p>
								</div>
							</a>
						</li>
					);
				}):''
			}</ul>
		</div>
	);
};

export default Articles;
