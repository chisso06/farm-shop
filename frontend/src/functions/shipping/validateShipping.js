import { areaList } from "../../data";

const validateShipping = ({method, fees}) => {
	var message = '';

	if ((typeof method.name) !== 'string' || !method.name || method.name.length > 10) {
		message = '配送方法名を10字以内で入力してください';
		return message;
	}

	fees.map((fee, i) => {
		if ((typeof fee.size) !== 'string' || !fee.size || fee.size.length > 10)
			message = 'サイズ名を10字以内で入力してください';
		else if (isNaN(Number(fee.min_n)) || !fee.min_n)
			message = '各サイズの個数条件の最小値を半角数字で入力してください';
		else if (isNaN(Number(fee.max_n)) || !fee.max_n)
			message = '各サイズの個数条件の最大値を半角数字で入力してください';

		if (message)
			return true;

		areaList.map((area) => {
			const area_fee = fee[area.method_name];
			if (isNaN(Number(area_fee)))
				message = '各サイズの送料を半角数字で入力してください';
			return message.length > 0;
		});

		if (message)
			return true;

		// 条件
		if (!i && fee.min_n !== 1)
			message = '一番下のサイズの個数の条件の最小値は1に設定してください';
		else if (fee.min_n > fee.max_n)
			message = 'サイズの個数の条件の最大値が最小値と同値以上になるように設定してください';
		else if (i !== fees.length - 1 && fee.max_n + 1 !== fees[i + 1].min_n)
			message = '上のサイズの個数の条件の最小値が下のサイズの個数の条件の最大値よりも1大きい値になるように設定してください';

		if (message)
			return true;

		// サイズ名が重複していないか
		for (var fee_i = i + 1; fee_i < fees.length; fee_i ++) {
			if (fee.size === fees[fee_i].size) {
				message = 'サイズ名が重複しています';
				break ;
			}
		}

		return message.length > 0;
	});

	return message;
};

export default validateShipping;