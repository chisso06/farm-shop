import { React, useContext } from 'react';
import { LoadingContext } from '../functions/context/LoadingFunc';

const Loading = () => {
	const context = useContext(LoadingContext);

	if (context.loading) {
		return (
			<div className='animate-pulse fixed z-50 top-0 w-full h-screen flex justify-center items-center bg-white opacity-80'>
				<div className="animate-spin h-32 w-32 border-2 border-stone-400 rounded-full border-t-transparent" />
				<p className='absolute text-stone-500'>Loading...</p>
			</div>
		);
	}
};

export default Loading;