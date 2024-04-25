import { React } from 'react';

const AboutContents = () => {
	const contents = [
		{
			title: "ひだまり農園",
			text: "「ひだまり農園」は、自然と調和し、美しい風景が広がる穏やかな場所に位置する農園です。私たちの農園は、豊かな土地と熱心な農家たちによって育てられ、新鮮で健康的な食材を提供しています。",
		},
		{
			title: "ひだまり農園について",
			text: "ひだまり農園では、持続可能な農業と自然との調和を大切にしています。広々とした農地には、野菜畑、果樹園、そして美しい花々が咲き誇り、季節ごとに異なる魅力を楽しむことができます。私たちは農薬や化学肥料を極力使用せず、土地の生態系を保護し、美しい景観を守っています。",
		},
		{
			title: "自然との共生",
			text: "ひだまり農園の収穫物は、新鮮さと品質にこだわって栽培されています。野菜や果物は完璧な熟度で収穫され、その日のうちに店舗に並びます。私たちの農場から食卓への距離は短く、食材のおいしさがそのまま味わえます。",
		},
		{
			title: "新鮮な収穫",
			text: "ひだまり農園は、訪れる人々に農業の楽しさと重要性を体験させる場所でもあります。農園ツアーやハンズオンの農業体験を通じて、農業に関する知識を深める機会を提供しています。また、地元のコミュニティイベントやフェスティバルも行い、人々が一堂に集まり、楽しいひとときを過ごす場として親しまれています。",
		},
		{
			title: "体験と学び",
			text: "「ひだまり農園」は、自然との調和、新鮮な食材、そして農業の魅力を広める場所として、皆さまのご訪問を心よりお待ちしています。私たちの農園で、自然とのふれあいと美味しい食事を楽しんでください。",
		},
	];
	const Image = ({i}) => {
		return (
			<img
				alt='aboutImage'
				className='h-60 sm:h-80 w-full object-cover'
				src={'/images/about' + i + '.jpg'} />
		);
	};

	return (
		<div className='bg-stone-100'>{
			contents.length ? contents.map((content, i) => {
				return (
					<div key={i} className='sm:h-80 sm:grid sm:grid-cols-2'>
						{(Boolean)(!(i % 2) || window.matchMedia('(max-width: 640px)').matches) ?
							<Image i={i} /> : ''
						}
						<div className='p-10'>
							<p className='mb-10 text-center text-xl'>{content.title}</p>
							<p>{content.text}</p>
						</div>
						{(Boolean)((i % 2) && !window.matchMedia('(max-width: 640px)').matches) ?
							<Image i={i} /> : ''
						}
					</div>
				)
			}):''
		}</div>
	);
}

const About = () => {
	return (
		<div className='my-16 sm:mb-40'>
			<p className='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-lime-800 text-white'>ひだまり農園について</p>
			<AboutContents />
			<p className='my-10 sm:mt-20 text-center text-2xl sm:text-4xl text-black'>アクセス</p>
			<div className='w-3/4 sm:h-80 mx-auto sm:grid sm:grid-cols-2'>
				<div className='p-4 bg-stone-200'>
					<div className='mb-4 flex items-center'>
						<img src='logo.jpg' alt='ロゴ' className='h-14' />
						<p className='ml-4 text-xl text-stone-900'>ひだまり農園</p>
					</div>
					<div className='p-3 sm:flex items-center border-b border-black'>
						<p className='w-28 font-bold' >会社名</p>
						<p>ひだまり株式会社</p>
					</div>
					<div className='p-3 sm:flex items-center border-b border-black'>
						<p className='w-28 font-bold' >住所</p>
						<p>〒630-8215<br />奈良県奈良市 東向中町29</p>
					</div>
					<div className='p-3 sm:flex items-center border-b border-black'>
						<p className='w-28 font-bold' >電話番号</p>
						<p>090-1234-5678</p>
					</div>
					<div className='p-3 sm:flex items-center'>
						<p className='w-28 font-bold' >生産物</p>
						<p>米、野菜、米粉菓子</p>
					</div>
				</div>
				<iframe
					src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13123.318618293442!2d135.8275275!3d34.6842485!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60013a29d1dd2621%3A0x540d42181874f344!2z6L-R6YmE5aWI6Imv6aeF!5e0!3m2!1sja!2sjp!4v1698193943218!5m2!1sja!2sjp"
					className='w-full aspect-square sm:h-full bg-stone-300'
					allowfullscreen=""
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					title='map'
				></iframe>
			</div>
		</div>
	);
};

export default About;