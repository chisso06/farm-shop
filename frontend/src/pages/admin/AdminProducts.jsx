import { React, useState } from 'react';
import { AdminProductForm, AdminProductsIndex } from '../../components';

const AdminProducts = () => {
	const [productId, setProductId] = useState(-1);

	return (
		productId >= 0 ? 
		<AdminProductForm productId={productId} setProductId={setProductId} />
		:
		<AdminProductsIndex setProductId={setProductId} />
	);
};

export default AdminProducts;
