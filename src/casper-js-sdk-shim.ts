import * as casperSdk from 'casper-js-sdk-original';

const sdk = (casperSdk as any).default && (casperSdk as any).default.Deploy ? (casperSdk as any).default : casperSdk;

// Extract everything from sdk
export const {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  StoredContractByHash,
  ContractHash,
  Args,
  CLValue,
  CLTypeString,
  CLTypeUInt32,
  PublicKey,
  TransferDeployItem
} = sdk;

// Define specific aliases for missing exports
export const CLValueUInt512 = CLValue;
export const CLValueString = CLValue;

// Polyfill ContractHash.fromHex on ContractHash
if (!(ContractHash as any).fromHex) {
  (ContractHash as any).fromHex = function(hex: string) {
    return ContractHash.newContract(hex);
  };
}

// Polyfill ExecutableDeployItem.newStoredContractByHashCall on ExecutableDeployItem
if (!(ExecutableDeployItem as any).newStoredContractByHashCall) {
  (ExecutableDeployItem as any).newStoredContractByHashCall = function(
    hash: any,
    entryPoint: string,
    args: any
  ) {
    const item = new ExecutableDeployItem();
    item.storedContractByHash = new StoredContractByHash(
      hash,
      entryPoint,
      args
    );
    return item;
  };
}

// Polyfill Deploy.prototype.toJSON
if (!Deploy.prototype.toJSON) {
  Deploy.prototype.toJSON = function() {
    return Deploy.toJSON(this);
  };
}

// Metaprogramming Interceptor for Deploy.prototype.approvals
const rawToDer = (rHex: string, sHex: string): string => {
  const rBytes: number[] = [];
  for (let i = 0; i < 32; i++) {
    rBytes.push(parseInt(rHex.substring(i * 2, i * 2 + 2), 16) || 0);
  }
  const sBytes: number[] = [];
  for (let i = 0; i < 32; i++) {
    sBytes.push(parseInt(sHex.substring(i * 2, i * 2 + 2), 16) || 0);
  }

  while (rBytes.length > 1 && rBytes[0] === 0) {
    rBytes.shift();
  }
  if (rBytes[0] >= 0x80) {
    rBytes.unshift(0);
  }

  while (sBytes.length > 1 && sBytes[0] === 0) {
    sBytes.shift();
  }
  if (sBytes[0] >= 0x80) {
    sBytes.unshift(0);
  }

  const rLen = rBytes.length;
  const sLen = sBytes.length;
  const totalLen = 2 + rLen + 2 + sLen;

  const derBytes = [
    0x30,
    totalLen,
    0x02,
    rLen,
    ...rBytes,
    0x02,
    sLen,
    ...sBytes
  ];

  return derBytes.map(b => b.toString(16).padStart(2, '0')).join('');
};

const originalPush = Array.prototype.push;
Object.defineProperty(Deploy.prototype, 'approvals', {
  get() {
    if (!this._approvals) {
      this._approvals = [];
    }
    if (!this._approvals._hooked) {
      this._approvals._hooked = true;
      const self = this;
      this._approvals.push = function(...items: any[]) {
        const mappedItems = items.map(item => {
          if (item && typeof item === 'object' && item.signer && item.signature && typeof item.signature === 'string' && typeof item.signature.toLowerCase === 'function') {
            // Check if it's already an instance of the SDK's internal Approval class
            if (item.constructor && item.constructor.name === 'e') {
              return item;
            }
            try {
              const cleanSig = item.signature.toLowerCase().replace(/^0x/, '');
              const cleanSigner = item.signer.trim();
              const pubKey = PublicKey.fromHex(cleanSigner);
              
              let algTag = cleanSigner.substring(0, 2);
              if (algTag !== '01' && algTag !== '02') {
                algTag = '01';
              }
              
              let sigHex = '';
              if (algTag === '01') {
                // Ed25519 is always 64 bytes (128 hex chars)
                if (cleanSig.length === 130 && cleanSig.startsWith('01')) {
                  sigHex = cleanSig;
                } else {
                  let raw = cleanSig;
                  if (cleanSig.length === 130 && (cleanSig.startsWith('01') || cleanSig.startsWith('02'))) {
                    raw = cleanSig.substring(2);
                  }
                  if (raw.length < 128) {
                    raw = raw.padStart(128, '0');
                  } else if (raw.length > 128) {
                    raw = raw.substring(0, 128);
                  }
                  sigHex = '01' + raw;
                }
              } else {
                // Secp256k1 DER sequence check or raw check
                if (cleanSig.startsWith('0230')) {
                  sigHex = cleanSig;
                } else if (cleanSig.startsWith('30')) {
                  sigHex = '02' + cleanSig;
                } else {
                  // Raw/compact signature (r + s), convert to DER
                  let raw = cleanSig;
                  if (raw.length === 130 && raw.startsWith('02')) {
                    raw = raw.substring(2);
                  }
                  
                  let rHex = '';
                  let sHex = '';
                  if (raw.length <= 128) {
                    if (raw.length >= 64) {
                      rHex = raw.substring(0, 64);
                      sHex = raw.substring(64).padStart(64, '0');
                    } else {
                      rHex = raw.substring(0, Math.floor(raw.length / 2)).padStart(64, '0');
                      sHex = raw.substring(Math.floor(raw.length / 2)).padStart(64, '0');
                    }
                  } else {
                    rHex = raw.substring(0, 64);
                    sHex = raw.substring(64, 128);
                  }

                  const derPart = rawToDer(rHex, sHex);
                  sigHex = '02' + derPart;
                }
              }

              const byteLen = Math.floor(sigHex.length / 2);
              const sigBytes = new Uint8Array(byteLen);
              for (let i = 0; i < byteLen; i++) {
                sigBytes[i] = parseInt(sigHex.substring(i * 2, i * 2 + 2), 16) || 0;
              }
              
              // Use SDK's native setSignature to construct a valid internal Approval class instance
              const dummyDeploy = Deploy.makeDeploy(self.header, self.payment, self.session);
              const tempDeploy = Deploy.setSignature(dummyDeploy, sigBytes, pubKey);
              return tempDeploy.approvals[0];
            } catch (err) {
              console.error('Failed to map approval in proxy:', err);
              return item;
            }
          }
          return item;
        });
        return originalPush.apply(this, mappedItems);
      };
    }
    return this._approvals;
  },
  set(val) {
    this._approvals = val;
  },
  configurable: true
});

// Export default as the sdk itself
export default sdk;
