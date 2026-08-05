interface Window {
  SP_FORM_ID?: string;
  SPACEREMIT?: {
    init: (options: {
      public_key: string;
      form_id: string;
      card_container_id: string;
      amount: number;
      currency: string;
      customer_email?: string;
      customer_name?: string;
      notes?: string;
    }) => void;
  };
  SpaceRemit?: {
    init: (options: {
      public_key: string;
      form_id: string;
      card_container_id: string;
      amount: number;
      currency: string;
      customer_email?: string;
      customer_name?: string;
      notes?: string;
    }) => void;
  };
  SP_SUCCESSFUL_PAYMENT?: (code: string) => void;
  SP_FAILD_PAYMENT?: () => void;
  SP_RECIVED_MESSAGE?: (msg: string) => void;
}
