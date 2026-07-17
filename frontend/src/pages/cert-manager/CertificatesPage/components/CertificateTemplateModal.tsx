import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon } from "lucide-react";
import { z } from "zod";

import { createNotification } from "@app/components/notifications";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalContent,
  Select,
  SelectItem,
  Tooltip
} from "@app/components/v2";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from "@app/components/v3";
import { useProject } from "@app/context";
import {
  CaStatus,
  useCreateCertTemplate,
  useGetCertTemplate,
  useListWorkspaceCas,
  useListWorkspacePkiCollections,
  useUpdateCertTemplate
} from "@app/hooks/api";
import { caTypeToNameMap } from "@app/hooks/api/ca/constants";
import {
  EXTENDED_KEY_USAGES_OPTIONS,
  KEY_USAGES_OPTIONS
} from "@app/hooks/api/certificates/constants";
import { CertExtendedKeyUsage, CertKeyUsage } from "@app/hooks/api/certificates/enums";
import { UsePopUpState } from "@app/hooks/usePopUp";

const validateTemplateRegexField = z.string().trim().min(1).max(100);

const schema = z.object({
  caId: z.string(),
  collectionId: z.string().optional(),
  name: z.string().min(1),
  commonName: validateTemplateRegexField,
  subjectAlternativeName: validateTemplateRegexField,
  ttl: z.string().trim().min(1),
  keyUsages: z.object({
    [CertKeyUsage.DIGITAL_SIGNATURE]: z.boolean().optional(),
    [CertKeyUsage.KEY_ENCIPHERMENT]: z.boolean().optional(),
    [CertKeyUsage.NON_REPUDIATION]: z.boolean().optional(),
    [CertKeyUsage.DATA_ENCIPHERMENT]: z.boolean().optional(),
    [CertKeyUsage.KEY_AGREEMENT]: z.boolean().optional(),
    [CertKeyUsage.KEY_CERT_SIGN]: z.boolean().optional(),
    [CertKeyUsage.CRL_SIGN]: z.boolean().optional(),
    [CertKeyUsage.ENCIPHER_ONLY]: z.boolean().optional(),
    [CertKeyUsage.DECIPHER_ONLY]: z.boolean().optional()
  }),
  extendedKeyUsages: z.object({
    [CertExtendedKeyUsage.CLIENT_AUTH]: z.boolean().optional(),
    [CertExtendedKeyUsage.CODE_SIGNING]: z.boolean().optional(),
    [CertExtendedKeyUsage.EMAIL_PROTECTION]: z.boolean().optional(),
    [CertExtendedKeyUsage.OCSP_SIGNING]: z.boolean().optional(),
    [CertExtendedKeyUsage.SERVER_AUTH]: z.boolean().optional(),
    [CertExtendedKeyUsage.TIMESTAMPING]: z.boolean().optional()
  })
});

export type FormData = z.infer<typeof schema>;

type Props = {
  caId: string;
  popUp: UsePopUpState<["certificateTemplate"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["certificateTemplate"]>,
    state?: boolean
  ) => void;
};

export const CertificateTemplateModal = ({ popUp, handlePopUpToggle, caId }: Props) => {
  const { currentProject } = useProject();
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const closeRequestFocusRef = useRef<HTMLElement | null>(null);
  const initializedSessionRef = useRef<string | undefined>(undefined);
  const shouldRestoreCloseRequestFocusRef = useRef(false);
  const submissionInFlightRef = useRef(false);

  const certificateTemplateId = (popUp?.certificateTemplate?.data as { id: string } | undefined)
    ?.id;

  const { data: certTemplate } = useGetCertTemplate(certificateTemplateId || "");

  const { data: cas } = useListWorkspaceCas({
    projectId: currentProject?.id,
    status: CaStatus.ACTIVE
  });

  const { data: collectionsData } = useListWorkspacePkiCollections({
    projectId: currentProject?.id || ""
  });

  const { mutateAsync: createCertTemplate, isPending: isCreatePending } = useCreateCertTemplate();
  const { mutateAsync: updateCertTemplate, isPending: isUpdatePending } = useUpdateCertTemplate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      caId,
      collectionId: undefined,
      name: "",
      commonName: "",
      subjectAlternativeName: "",
      ttl: "",
      keyUsages: {
        [CertKeyUsage.DIGITAL_SIGNATURE]: true,
        [CertKeyUsage.KEY_ENCIPHERMENT]: true
      },
      extendedKeyUsages: {}
    }
  });

  const isSubmitPending = isSubmitting || isCreatePending || isUpdatePending;

  useEffect(() => {
    if (!popUp.certificateTemplate.isOpen) {
      initializedSessionRef.current = undefined;
      return;
    }

    const sessionId = certificateTemplateId || "create";
    if (initializedSessionRef.current === sessionId || (certificateTemplateId && !certTemplate)) {
      return;
    }

    if (certTemplate) {
      reset({
        caId: certTemplate.caId,
        name: certTemplate.name,
        commonName: certTemplate.commonName,
        subjectAlternativeName: certTemplate.subjectAlternativeName,
        collectionId: certTemplate.pkiCollectionId ?? undefined,
        ttl: certTemplate.ttl,
        keyUsages: Object.fromEntries(certTemplate.keyUsages.map((name) => [name, true]) ?? []),
        extendedKeyUsages: Object.fromEntries(
          certTemplate.extendedKeyUsages.map((name) => [name, true]) ?? []
        )
      });
    } else {
      reset({
        caId,
        name: "",
        commonName: "",
        subjectAlternativeName: "",
        ttl: "",
        keyUsages: {
          [CertKeyUsage.DIGITAL_SIGNATURE]: true,
          [CertKeyUsage.KEY_ENCIPHERMENT]: true
        },
        extendedKeyUsages: {}
      });
    }

    initializedSessionRef.current = sessionId;
  }, [caId, certificateTemplateId, certTemplate, popUp.certificateTemplate.isOpen, reset]);

  const closeWorkflow = () => {
    shouldRestoreCloseRequestFocusRef.current = false;
    setConfirmDiscardOpen(false);
    reset();
    handlePopUpToggle("certificateTemplate", false);
  };

  const requestClose = (focusTarget?: HTMLElement | null) => {
    if (isSubmitPending) {
      return;
    }

    if (isDirty) {
      closeRequestFocusRef.current = focusTarget ?? (document.activeElement as HTMLElement | null);
      shouldRestoreCloseRequestFocusRef.current = true;
      setConfirmDiscardOpen(true);
      return;
    }

    closeWorkflow();
  };

  const onFormSubmit = async ({
    collectionId,
    name,
    commonName,
    subjectAlternativeName,
    ttl,
    keyUsages,
    extendedKeyUsages
  }: FormData) => {
    if (!currentProject?.id || submissionInFlightRef.current) {
      return;
    }

    submissionInFlightRef.current = true;

    try {
      if (certTemplate) {
        await updateCertTemplate({
          id: certTemplate.id,
          projectId: currentProject.id,
          pkiCollectionId: collectionId,
          caId,
          name,
          commonName,
          subjectAlternativeName,
          ttl,
          keyUsages: Object.entries(keyUsages)
            .filter(([, value]) => value)
            .map(([key]) =>
              key === CertKeyUsage.CRL_SIGN
                ? "cRLSign"
                : key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
            ),
          extendedKeyUsages: Object.entries(extendedKeyUsages)
            .filter(([, value]) => value)
            .map(([key]) => key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()))
        });

        createNotification({
          text: "Successfully updated certificate template",
          type: "success"
        });
      } else {
        await createCertTemplate({
          projectId: currentProject.id,
          pkiCollectionId: collectionId,
          caId,
          name,
          commonName,
          subjectAlternativeName,
          ttl,
          keyUsages: Object.entries(keyUsages)
            .filter(([, value]) => value)
            .map(([key]) =>
              key === CertKeyUsage.CRL_SIGN
                ? "cRLSign"
                : key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
            ),
          extendedKeyUsages: Object.entries(extendedKeyUsages)
            .filter(([, value]) => value)
            .map(([key]) => key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()))
        });

        createNotification({
          text: "Successfully created certificate template",
          type: "success"
        });
      }

      closeWorkflow();
    } catch (error) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;

      createNotification({
        text:
          errorMessage ||
          (error instanceof Error
            ? error.message
            : `Failed to ${certTemplate ? "update" : "create"} certificate template`),
        type: "error"
      });
    } finally {
      submissionInFlightRef.current = false;
    }
  };

  return [
    <Modal
      key="certificate-template-modal"
      isOpen={popUp?.certificateTemplate?.isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          requestClose();
        }
      }}
    >
      <ModalContent
        title={certTemplate ? "Certificate Template" : "Create Certificate Template"}
        showCloseButton={!isSubmitPending}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
          const focusTarget = document.activeElement as HTMLElement | null;
          window.requestAnimationFrame(() => requestClose(focusTarget));
        }}
      >
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {certTemplate && (
            <FormControl label="Certificate Template ID">
              <Input value={certTemplate.id} isDisabled className="bg-white/[0.07]" />
            </FormControl>
          )}
          <Controller
            control={control}
            defaultValue=""
            name="name"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Template Name"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="My Certificate Template" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="caId"
            defaultValue={caId}
            render={({ field: { onChange, ...field }, fieldState: { error } }) => (
              <FormControl
                label="Issuing CA"
                errorText={error?.message}
                isError={Boolean(error)}
                className="mt-4"
                isRequired
              >
                <Select
                  defaultValue={field.value}
                  {...field}
                  onValueChange={(e) => onChange(e)}
                  className="w-full"
                  isDisabled
                >
                  {(cas || []).map(({ id, type, dn }) => (
                    <SelectItem value={id} key={`ca-${id}`}>
                      {`${caTypeToNameMap[type]}: ${dn}`}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="collectionId"
            render={({ field: { onChange, ...field }, fieldState: { error } }) => (
              <FormControl
                label="Certificate Collection (Optional)"
                errorText={error?.message}
                isError={Boolean(error)}
                className="mt-4"
              >
                <Select
                  defaultValue={field.value}
                  {...field}
                  onValueChange={(e) => onChange(e)}
                  className="w-full"
                >
                  {(collectionsData?.collections || []).map(({ id, name }) => (
                    <SelectItem value={id} key={`pki-collection-${id}`}>
                      {name}
                    </SelectItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            defaultValue=""
            name="commonName"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label={
                  <div>
                    <FormLabel
                      isRequired
                      label="Common Name (CN)"
                      icon={
                        <Tooltip
                          className="text-center"
                          content={
                            <span>
                              This field accepts limited regular expressions: spaces, *, ., @, -, \
                              (for escaping), and alphanumeric characters only
                            </span>
                          }
                        >
                          <FontAwesomeIcon icon={faQuestionCircle} size="sm" />
                        </Tooltip>
                      }
                    />
                  </div>
                }
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder=".*\.acme.com" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            defaultValue=""
            name="subjectAlternativeName"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label={
                  <div>
                    <FormLabel
                      isRequired
                      label="Alternative Names (SAN)"
                      icon={
                        <Tooltip
                          className="text-center"
                          content={
                            <span>
                              This field accepts limited regular expressions: spaces, *, ., @, -, \
                              (for escaping), and alphanumeric characters only
                            </span>
                          }
                        >
                          <FontAwesomeIcon icon={faQuestionCircle} size="sm" />
                        </Tooltip>
                      }
                    />
                  </div>
                }
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="service\.acme.\..*" />
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="ttl"
            render={({ field, fieldState: { error } }) => (
              <FormControl
                label="Max TTL"
                isError={Boolean(error)}
                errorText={error?.message}
                isRequired
              >
                <Input {...field} placeholder="2 days, 1d, 2h, 1y, ..." />
              </FormControl>
            )}
          />
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="key-usages" className="data-[state=open]:border-none">
              <AccordionTrigger className="h-fit flex-none pl-1 text-sm">
                <div className="order-1 ml-3">Key Usage</div>
              </AccordionTrigger>
              <AccordionContent>
                <Controller
                  control={control}
                  name="keyUsages"
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return (
                      <FormControl
                        label="Key Usage"
                        errorText={error?.message}
                        isError={Boolean(error)}
                      >
                        <div className="mt-2 mb-7 grid grid-cols-2 gap-2">
                          {KEY_USAGES_OPTIONS.map(({ label, value: optionValue }) => {
                            return (
                              <Checkbox
                                id={optionValue}
                                key={optionValue}
                                isChecked={value[optionValue]}
                                onCheckedChange={(state) => {
                                  onChange({
                                    ...value,
                                    [optionValue]: state
                                  });
                                }}
                              >
                                {label}
                              </Checkbox>
                            );
                          })}
                        </div>
                      </FormControl>
                    );
                  }}
                />
                <Controller
                  control={control}
                  name="extendedKeyUsages"
                  render={({ field: { onChange, value }, fieldState: { error } }) => {
                    return (
                      <FormControl
                        label="Extended Key Usage"
                        errorText={error?.message}
                        isError={Boolean(error)}
                      >
                        <div className="mt-2 mb-7 grid grid-cols-2 gap-2">
                          {EXTENDED_KEY_USAGES_OPTIONS.map(({ label, value: optionValue }) => {
                            return (
                              <Checkbox
                                id={optionValue}
                                key={optionValue}
                                isChecked={value[optionValue]}
                                onCheckedChange={(state) => {
                                  onChange({
                                    ...value,
                                    [optionValue]: state
                                  });
                                }}
                              >
                                {label}
                              </Checkbox>
                            );
                          })}
                        </div>
                      </FormControl>
                    );
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="mt-4 flex items-center">
            <Button
              className="mr-4"
              size="sm"
              type="submit"
              isLoading={isSubmitPending}
              isDisabled={isSubmitPending}
            >
              Save
            </Button>
            <Button
              type="button"
              colorSchema="secondary"
              variant="plain"
              isDisabled={isSubmitPending}
              onClick={() => requestClose()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>,

    <AlertDialog
      key="certificate-template-discard-dialog"
      open={confirmDiscardOpen}
      onOpenChange={setConfirmDiscardOpen}
    >
      <AlertDialogContent
        onCloseAutoFocus={(event) => {
          if (shouldRestoreCloseRequestFocusRef.current) {
            event.preventDefault();
            closeRequestFocusRef.current?.focus();
            shouldRestoreCloseRequestFocusRef.current = false;
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangleIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Your unsaved certificate template changes will be permanently lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          <AlertDialogAction type="button" variant="danger" onClick={closeWorkflow}>
            Discard changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ];
};
