import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { getBlogs, getIndexBase64Images, imageSrc } from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminBlogs = () => {
	const [blogs, setBlogs] = useState([]);
	const [base64Images, setBase64Images] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);
	const navigate = useNavigate();

	const handleClick = (e, blog_id) => {
		e.preventDefault();
		navigate(`/admin/blogs/${blog_id}`);
	}

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var blogsData;
			var base64ImagesData;

			try {
				blogsData = await getBlogs();
			} catch (err) {
				showBoundary(err);
				return ;
			}
			try {
				base64ImagesData = await getIndexBase64Images({ table: 'blogs', objects: blogsData });
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setBlogs(blogsData);
			setBase64Images(base64ImagesData);

			context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div>
			<div className='px-4 pb-4 flex items-center'>
				<p className='w-1/2 font-mono text-2xl font-bold'>ブログ管理</p>
				<div className='w-1/2 flex justify-end'>
					<a
						href='/admin/blogs/0'
						className='w-40 p-2 text-center text-white font-mono font-bold bg-amber-600 font-mono hover:bg-amber-500 rounded'>
						+ブログを作成する
					</a>
				</div>
			</div>
			<table className='w-full'>
				<thead>
					<tr className='border-b font-mono'>
						<th className='pl-4 py-2 text-left'>タイトル</th>
						<th className='py-2'>作成日</th>
						<th className='py-2 pr-4'>更新日</th>
					</tr>
				</thead>
				<tbody>
					{blogs ? blogs.map((blog, i) => {return (
						<tr
							onClick={(e) => handleClick(e, blog.id)}
							key={i}
							className='border-b  hover:cursor-pointer hover:bg-amber-100'>
							<td className='pl-4 py-1 flex items-center'>
								<img
									src={imageSrc(base64Images[blog.base64Images_idx])}
									alt='ブログのトップ画像'
									className='w-12 mr-4 aspect-square object-cover rounded' />
								{blog.title && blog.title.length <= 25 ? blog.title : blog.title.substring(0, 24) + '…'}
							</td>
							<td className='py-1 text-center'>{blog.created_at}</td>
							<td className='py-1 pr-4 text-center'>{blog.updated_at}</td>
						</tr>
					)}):''}
				</tbody>
			</table>
		</div>
	)
}

export default AdminBlogs;