interface PaystackSetupConfig {
  key: string;
  access_code: string;
  onSuccess: (transaction: { reference: string; trans?: string; status?: string }) => void;
  onCancel: () => void;
}

interface PaystackPopHandler {
  openIframe: () => void;
}

interface PaystackPopStatic {
  setup: (config: PaystackSetupConfig) => PaystackPopHandler;
}

interface Window {
  PaystackPop: PaystackPopStatic;
}
