import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const cfg = new pulumi.Config();

const provider = new aws.Provider(
  "aws",
  {
    ...aws.config,
    defaultTags: {
      tags: {
        Provider: "Pulumi",
        Project: "pulumi-state",
        Service: "pulumi-state",
        Environment: "landing-zone",
        stack: cfg.name,
      },
    },
  },
  {
    ignoreChanges: ["profile"],
  },
);

const kms = new aws.kms.Key("kmsKey", {
  description: "KMS Key for managing pulumi secrets",
  deletionWindowInDays: 7,
  policy: `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Enable IAM User Permissions",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::123123123123:root"
            },
            "Action": "kms:*",
            "Resource": "*"
        },
        {
            "Sid": "Allow access for Key Administrators",
            "Effect": "Allow",
            "Principal": {
                "AWS": ${JSON.stringify(cfg.requireObject<String[]>("allowedRoles"))}
            },
            "Action": [
                "kms:**"
            ],
            "Resource": "*"
        }
    ]
}`,
});

const alias = new aws.kms.Alias("kmsAlias", {
  name: `alias/${cfg.name}-secret-key`,
  targetKeyId: kms.keyId,
});

const s3 = new aws.s3.Bucket("pulumi-state", {
  acl: "private",
  forceDestroy: true,
  bucketPrefix: `${cfg.name}-pulumi-state`,
});

const s3Policy = new aws.s3.BucketPolicy("pulumi-state-polict", {
  bucket: s3.bucket,
  policy: pulumi.interpolate`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:*",
            "Principal": {
              "AWS": ${JSON.stringify(cfg.requireObject<String[]>("allowedRoles"))}
            },
            "Resource": [
              "${s3.arn}/*",
              "${s3.arn}"
            ]
        }
    ]
  }`,
});

export const output = {
  kms: {
    id: kms.keyId,
    region: provider.region,
    connectString: pulumi.interpolate`awskms:///${kms.arn}&awssdk=v3`, // awssdk=3 to be compatiable with sso sessions
  },
  s3: {
    bucket: s3.bucket,
    connectString: pulumi.interpolate`s3://${s3.bucket}?region=${provider.region}&awssdk=v3`, // awssdk=3 to be compatiable with sso sessions
  },
};
