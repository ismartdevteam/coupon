
DROP PROCEDURE MODIFY_COUPON;
DELIMITER $$
 
CREATE PROCEDURE CHECK_VENDOR_ACCESS(
IN r_key varchar(45),
IN r_vendor_key varchar(45),
IN r_vendor_id int,
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

			set o_code =200;
    else
		set o_code =401;
   
    end if;
    
    
END$$
 
DELIMITER ;
