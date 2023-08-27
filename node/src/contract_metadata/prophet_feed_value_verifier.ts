const metadata = {
  "source": {
    "hash": "0x2ee600430140b21b01c73d46a89567d97bae7ec568a116968c577e485178d45c",
    "language": "ink! 4.3.0",
    "compiler": "rustc 1.71.1",
    "build_info": {
      "build_mode": "Release",
      "cargo_contract_version": "3.0.1",
      "rust_toolchain": "stable-aarch64-apple-darwin",
      "wasm_opt_settings": {
        "keep_debug_symbols": false,
        "optimization_passes": "Z"
      }
    }
  },
  "contract": {
    "name": "prophet_feed_value_verifier",
    "version": "0.1.0",
    "authors": [
      "[your_name] <[your_email]>"
    ]
  },
  "spec": {
    "constructors": [
      {
        "args": [
          {
            "label": "storage_contract_code_hash",
            "type": {
              "displayName": [
                "Hash"
              ],
              "type": 4
            }
          }
        ],
        "default": false,
        "docs": [
          "Constructor that initializes the `bool` value to the given `init_value`."
        ],
        "label": "new",
        "payable": false,
        "returnType": {
          "displayName": [
            "ink_primitives",
            "ConstructorResult"
          ],
          "type": 5
        },
        "selector": "0x9bae9d5e"
      },
      {
        "args": [],
        "default": false,
        "docs": [
          "Constructor that initializes the `bool` value to `false`.",
          "",
          "Constructors can delegate to other constructors."
        ],
        "label": "default",
        "payable": false,
        "returnType": {
          "displayName": [
            "ink_primitives",
            "ConstructorResult"
          ],
          "type": 5
        },
        "selector": "0xed4b9d1b"
      }
    ],
    "docs": [],
    "environment": {
      "accountId": {
        "displayName": [
          "AccountId"
        ],
        "type": 0
      },
      "balance": {
        "displayName": [
          "Balance"
        ],
        "type": 11
      },
      "blockNumber": {
        "displayName": [
          "BlockNumber"
        ],
        "type": 9
      },
      "chainExtension": {
        "displayName": [
          "ChainExtension"
        ],
        "type": 21
      },
      "hash": {
        "displayName": [
          "Hash"
        ],
        "type": 4
      },
      "maxEventTopics": 4,
      "timestamp": {
        "displayName": [
          "Timestamp"
        ],
        "type": 10
      }
    },
    "events": [],
    "lang_error": {
      "displayName": [
        "ink",
        "LangError"
      ],
      "type": 7
    },
    "messages": [
      {
        "args": [],
        "default": false,
        "docs": [
          " Get storage contract address"
        ],
        "label": "get_storage_address",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 8
        },
        "selector": "0x7fa4844d"
      },
      {
        "args": [
          {
            "label": "pair_id",
            "type": {
              "displayName": [
                "TPairId"
              ],
              "type": 9
            }
          },
          {
            "label": "round_id",
            "type": {
              "displayName": [
                "TRoundId"
              ],
              "type": 10
            }
          },
          {
            "label": "value",
            "type": {
              "displayName": [
                "TValue"
              ],
              "type": 11
            }
          },
          {
            "label": "decimal",
            "type": {
              "displayName": [
                "TDecimal"
              ],
              "type": 12
            }
          },
          {
            "label": "timestamp",
            "type": {
              "displayName": [
                "Timestamp"
              ],
              "type": 10
            }
          }
        ],
        "default": false,
        "docs": [
          " A message that can be called on instantiated contracts.",
          " This one flips the value of the stored `bool` from `true`",
          " to `false` and vice versa."
        ],
        "label": "restricted_update_new_answer",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 13
        },
        "selector": "0xc7ead32c"
      },
      {
        "args": [
          {
            "label": "answers",
            "type": {
              "displayName": [
                "Vec"
              ],
              "type": 16
            }
          }
        ],
        "default": false,
        "docs": [],
        "label": "restricted_update_new_answers",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 13
        },
        "selector": "0xb051ea90"
      },
      {
        "args": [
          {
            "label": "pair_id",
            "type": {
              "displayName": [
                "TPairId"
              ],
              "type": 9
            }
          },
          {
            "label": "answers",
            "type": {
              "displayName": [
                "Vec"
              ],
              "type": 18
            }
          },
          {
            "label": "signatures",
            "type": {
              "displayName": [
                "Vec"
              ],
              "type": 20
            }
          }
        ],
        "default": false,
        "docs": [],
        "label": "transmit_process",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 13
        },
        "selector": "0xef8f7da1"
      },
      {
        "args": [],
        "default": false,
        "docs": [],
        "label": "get_verifier",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 8
        },
        "selector": "0x3c5a0aab"
      }
    ]
  },
  "storage": {
    "root": {
      "layout": {
        "struct": {
          "fields": [
            {
              "layout": {
                "struct": {
                  "fields": [
                    {
                      "layout": {
                        "struct": {
                          "fields": [
                            {
                              "layout": {
                                "leaf": {
                                  "key": "0x00000000",
                                  "ty": 0
                                }
                              },
                              "name": "account_id"
                            }
                          ],
                          "name": "CallBuilder"
                        }
                      },
                      "name": "inner"
                    }
                  ],
                  "name": "ProphetFeedValueStorageRef"
                }
              },
              "name": "storage_contract"
            },
            {
              "layout": {
                "root": {
                  "layout": {
                    "leaf": {
                      "key": "0xeaed8499",
                      "ty": 3
                    }
                  },
                  "root_key": "0xeaed8499"
                }
              },
              "name": "nodes"
            },
            {
              "layout": {
                "root": {
                  "layout": {
                    "leaf": {
                      "key": "0x6729ff3d",
                      "ty": 3
                    }
                  },
                  "root_key": "0x6729ff3d"
                }
              },
              "name": "processed_txn"
            },
            {
              "layout": {
                "leaf": {
                  "key": "0x00000000",
                  "ty": 0
                }
              },
              "name": "owner"
            }
          ],
          "name": "ProphetFeedValueVerifier"
        }
      },
      "root_key": "0x00000000"
    }
  },
  "types": [
    {
      "id": 0,
      "type": {
        "def": {
          "composite": {
            "fields": [
              {
                "type": 1,
                "typeName": "[u8; 32]"
              }
            ]
          }
        },
        "path": [
          "ink_primitives",
          "types",
          "AccountId"
        ]
      }
    },
    {
      "id": 1,
      "type": {
        "def": {
          "array": {
            "len": 32,
            "type": 2
          }
        }
      }
    },
    {
      "id": 2,
      "type": {
        "def": {
          "primitive": "u8"
        }
      }
    },
    {
      "id": 3,
      "type": {
        "def": {
          "primitive": "bool"
        }
      }
    },
    {
      "id": 4,
      "type": {
        "def": {
          "composite": {
            "fields": [
              {
                "type": 1,
                "typeName": "[u8; 32]"
              }
            ]
          }
        },
        "path": [
          "ink_primitives",
          "types",
          "Hash"
        ]
      }
    },
    {
      "id": 5,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 6
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 7
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 6
          },
          {
            "name": "E",
            "type": 7
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 6,
      "type": {
        "def": {
          "tuple": []
        }
      }
    },
    {
      "id": 7,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "index": 1,
                "name": "CouldNotReadInput"
              }
            ]
          }
        },
        "path": [
          "ink_primitives",
          "LangError"
        ]
      }
    },
    {
      "id": 8,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 0
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 7
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 0
          },
          {
            "name": "E",
            "type": 7
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 9,
      "type": {
        "def": {
          "primitive": "u32"
        }
      }
    },
    {
      "id": 10,
      "type": {
        "def": {
          "primitive": "u64"
        }
      }
    },
    {
      "id": 11,
      "type": {
        "def": {
          "primitive": "u128"
        }
      }
    },
    {
      "id": 12,
      "type": {
        "def": {
          "primitive": "u16"
        }
      }
    },
    {
      "id": 13,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 14
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 7
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 14
          },
          {
            "name": "E",
            "type": 7
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 14,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 6
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 15
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 6
          },
          {
            "name": "E",
            "type": 15
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 15,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "index": 0,
                "name": "NotVerifierContract"
              },
              {
                "index": 1,
                "name": "EmptyAnswersFound"
              },
              {
                "index": 2,
                "name": "EmptySignaturesFound"
              },
              {
                "index": 3,
                "name": "NotMatchedAnswerLengthAndSignatureLength"
              },
              {
                "index": 4,
                "name": "NotOwner"
              }
            ]
          }
        },
        "path": [
          "prophet_feed_value_verifier",
          "prophet_feed_value_verifier",
          "Error"
        ]
      }
    },
    {
      "id": 16,
      "type": {
        "def": {
          "sequence": {
            "type": 17
          }
        }
      }
    },
    {
      "id": 17,
      "type": {
        "def": {
          "composite": {
            "fields": [
              {
                "name": "pair_id",
                "type": 9,
                "typeName": "TPairId"
              },
              {
                "name": "round_id",
                "type": 10,
                "typeName": "TRoundId"
              },
              {
                "name": "value",
                "type": 11,
                "typeName": "TValue"
              },
              {
                "name": "decimal",
                "type": 12,
                "typeName": "TDecimal"
              },
              {
                "name": "timestamp",
                "type": 10,
                "typeName": "Timestamp"
              }
            ]
          }
        },
        "path": [
          "prophet_feed_value_storage",
          "prophet_feed_value_storage",
          "AnswerParam"
        ]
      }
    },
    {
      "id": 18,
      "type": {
        "def": {
          "sequence": {
            "type": 19
          }
        }
      }
    },
    {
      "id": 19,
      "type": {
        "def": {
          "composite": {
            "fields": [
              {
                "name": "value",
                "type": 11,
                "typeName": "TValue"
              },
              {
                "name": "decimal",
                "type": 12,
                "typeName": "TDecimal"
              },
              {
                "name": "round_id",
                "type": 10,
                "typeName": "TRoundId"
              },
              {
                "name": "timestamp",
                "type": 10,
                "typeName": "Timestamp"
              }
            ]
          }
        },
        "path": [
          "prophet_feed_value_storage",
          "prophet_feed_value_storage",
          "AnswerData"
        ]
      }
    },
    {
      "id": 20,
      "type": {
        "def": {
          "sequence": {
            "type": 4
          }
        }
      }
    },
    {
      "id": 21,
      "type": {
        "def": {
          "variant": {}
        },
        "path": [
          "ink_env",
          "types",
          "NoChainExtension"
        ]
      }
    }
  ],
  "version": "4"
}

export {
  metadata as prophet_feed_value_verifier_metadata
}