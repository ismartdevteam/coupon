
DROP PROCEDURE ADD_COUPON;
DELIMITER $$
 
CREATE PROCEDURE ADD_COUPON(
IN r_key varchar(45),
IN r_vendor_key varchar(45),
IN r_vendor_id int,
IN r_coupon_name varchar(255),
IN r_coupon_desc varchar(1000),
IN r_type_id int,
IN r_discount varchar(45),
IN r_limit int,
IN r_start_date varchar(45),
IN r_end_date varchar(45),
IN r_image TEXT,
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
	update vendors  set coupons = JSON_ARRAY_APPEND(coupons,'$',JSON_OBJECT( 'coupon_id',HEX(AES_ENCRYPT(123, current_timestamp())),
    'coupon_name',r_coupon_name,'description',r_coupon_desc,'type_id',r_type_id,'discount',r_discount,'limit',r_limit,'discount',r_discount,'start_date',STR_TO_DATE(r_start_date,'%Y-%m-%d'),
    'end_date', STR_TO_DATE(r_end_date,'%Y-%m-%d'),'image_url', r_image,'created_date',current_timestamp())) where id=r_vendor_id;
			set o_code =200;
    else
		set o_code =401;
   
    end if;
    
    
END$$
 
DELIMITER ;

CREATE USER 'node-app'@'localhost' IDENTIFIED BY '_Mongolia88';
grant EXECUTE ON PROCEDURE  coupon.LOGIN_VENDOR to 'node-app'@'localhost';
FLUSH PRIVILEGES;