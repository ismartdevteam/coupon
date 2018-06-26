
DROP PROCEDURE ADD_PRODUCT;
DELIMITER $$
 
CREATE PROCEDURE ADD_PRODUCT(
IN r_key varchar(45),
IN r_vendor_key varchar(45),
IN r_vendor_id int,
IN r_product_name varchar(255),
IN r_product_price varchar(45),
IN r_product_desc TEXT,
out o_code INT
)
BEGIN
	declare count_api int;
    declare d_vendor_key varchar(45);
  
    SELECT  (select count(1)  from api_keys where type_id=0 and api_key=r_key ) ,
     (select api_key  from api_vendors where  vendor_id=r_vendor_id ) 
    into 
    count_api,d_vendor_key;
    if count_api >0 and d_vendor_key = r_vendor_key then
	update vendors  set vendor_products = JSON_ARRAY_APPEND(vendor_products,'$',JSON_OBJECT( 'product_id',HEX(AES_ENCRYPT(123, r_product_name)),
    'product_name',r_product_name,'product_price',r_product_price,'product_description',r_product_desc)) where id=r_vendor_id;
			set o_code =200;
    else
		set o_code =401;
   
    end if;
    
    
END$$
 
DELIMITER ;

CREATE USER 'node-app'@'localhost' IDENTIFIED BY '_Mongolia88';
grant EXECUTE ON PROCEDURE  coupon.LOGIN_VENDOR to 'node-app'@'localhost';
FLUSH PRIVILEGES;