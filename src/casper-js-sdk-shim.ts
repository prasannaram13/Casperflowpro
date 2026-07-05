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
  PublicKey
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
              let sigHex = cleanSig;
              if (sigHex.length === 128) {
                sigHex = algTag + sigHex;
              }
              const sigBytes = new Uint8Array(65);
              for (let i = 0; i < 65; i++) {
                sigBytes[i] = parseInt(sigHex.substring(i * 2, i * 2 + 2), 16);
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
