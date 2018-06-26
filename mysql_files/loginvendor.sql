
DROP PROCEDURE LOGIN_VENDOR;
DELIMITER $$
 
CREATE PROCEDURE LOGIN_VENDOR(
IN r_key varchar(45),
IN r_username varchar(45),
IN r_pass varchar(45),
out o_code INT,
out o_data JSON
)
BEGIN
	declare count_api int;
    declare count_vendor int;
    declare no_result int;
    declare d_vendor_name varchar(255);
    declare d_vendor_intro varchar(1000);
	declare d_vendor_id int;
    declare d_products JSON;
    SELECT count(1) into count_api from api_keys where type_id=0 and api_key=r_key;
    if count_api >0 then
		select  
		id , vendor_name,vendor_intro ,vendor_products
        into
        d_vendor_id, d_vendor_name, d_vendor_intro,d_products
        from vendors a where a.username =r_username and a.password=r_pass limit 1;
		
        if d_vendor_id is not null then

			select  
				 JSON_MERGE(
			 JSON_OBJECT('vendor_id',d_vendor_id ),
			   JSON_OBJECT('vendor_name',d_vendor_name ),
					JSON_OBJECT('vendor_intro',d_vendor_intro ),
							JSON_OBJECT('vendor_products',d_products ),
					   JSON_OBJECT('vendor_api_key',a.api_key )
						
			) into o_data
			 from api_vendors a where a.vendor_id=d_vendor_id;
			
			set o_code= 200;
        else
			set o_code = 302;
        end if;
    else
		set o_code =401;
   
    end if;
    
    
END$$
 
DELIMITER ;

CREATE USER 'node-app'@'localhost' IDENTIFIED BY '_Mongolia88';
grant EXECUTE ON PROCEDURE  coupon.LOGIN_VENDOR to 'node-app'@'localhost';
FLUSH PRIVILEGES;