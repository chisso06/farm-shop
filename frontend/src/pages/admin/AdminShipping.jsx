import { React, useState } from 'react';
import { AdminShippingForm, AdminShippingIndex } from '../../components';

const AdminShipping = () => {
	const [shippingId, setShippingId] = useState(-1);

	return (
		shippingId >= 0 ? 
		// <AdminProductsForm shippingId={shippingId} setShippingId={setShippingId} />
		<AdminShippingForm shippingId={shippingId} setShippingId={setShippingId} />
		:
		<AdminShippingIndex setShippingId={setShippingId} />
	)
}

export default AdminShipping;
